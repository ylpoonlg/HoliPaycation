mod db;

use bson::DateTime;
use bson::document::Document;
use itertools::Itertools;
use mongodb::bson::doc;
use mongodb::bson::oid::ObjectId;
use std::collections::HashMap;

#[macro_use] extern crate rocket;

#[get("/")]
fn root() -> &'static str {
    "HoliPaycation API"
}

// Trips
#[post("/create-trip?<trip_title>&<currency>&<members>")]
async fn create_trip(trip_title: &str, currency: &str, members: &str) -> String {
    let db_ref = db::get_db().await;
    let trips = db_ref.collection::<Document>("trips");
    let members: Vec<&str> = members.split(",").collect();

    const CHAR_SET: &str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    let mut id_exist = true;
    let mut trip_id: String = "abcdef".to_string();

    // Make sure id does not exist
    const MAX_TRIES: u8 = 100;
    let mut tries: u8 = 0;
    while id_exist && tries < MAX_TRIES {
        tries += 1;
        trip_id = random_string::generate(6, CHAR_SET);

        let result = trips.find_one(doc! {
            "trip_id": trip_id.clone(),
        }, None).await;
        
        if result.is_err() {
            return "{\"result\": \"db_failed\"}".to_string();
        }

        let result = result.unwrap();
        if result.is_none() {
            id_exist = false;
        }
    }
    if id_exist {
        println!("  ==> Failed to generate a new trip id");
        return "{\"result\": \"db_failed\"}".to_string();
    }

    let result = trips.insert_one(
        doc! {
            "trip_id":       trip_id.clone(),
            "title":         trip_title,
            "currency":      currency,
            "members":       members,
            "last_accessed": DateTime::now(),
        },
        None,
    ).await;

    if result.is_err() {
        return "{\"result\": \"db_failed\"}".to_string();
    }

    clear_expired_trips().await;

    let json = format!("{{
        \"result\": \"success\",
        \"trip_id\": \"{}\"
    }}", trip_id);
    json.to_string()
}

async fn clear_expired_trips() {
    let db_ref = db::get_db().await;
    let trips = db_ref.collection::<Document>("trips");
    let records = db_ref.collection::<Document>("records");

    let expire_duration: i64 = 1000 * 60 * 60 * 24 * 30; // 30 days
    // let expire_duration: i64 = 1000 * 30; // 30 seconds (debug)

    let result = trips.find(doc! {
        "last_accessed": {
            "$lt": DateTime::from_millis(DateTime::now().timestamp_millis() - expire_duration),
        },
    }, None).await;

    let mut cur = result.unwrap();
    while cur.advance().await.unwrap() {
        let record = cur.deserialize_current().unwrap();
        let trip_id = record.get_str("trip_id").unwrap();

        let delete_trip_result = trips.delete_one(doc! {
            "trip_id": trip_id,
        }, None).await;
        let delete_records_result = records.delete_many(doc! {
            "trip_id": trip_id,
        }, None).await;

        if delete_trip_result.is_ok() && delete_records_result.is_ok() {
            println!(" => Successfully deleted expired trip {}...", trip_id);
        }
    }
}

#[get("/<trip_id>/details")]
async fn get_trip_details(trip_id: &str) -> String {
    let db_ref = db::get_db().await;
    let trips = db_ref.collection::<Document>("trips");
    let result = trips.find_one(
        doc! {
            "trip_id": trip_id,
        },
        None,
    ).await;

    if result.is_err() {
        println!("  ==> Failed to get trip details");
        return "{\"result\": \"db_failed\"}".to_string();
    }

    let result = result.unwrap();
    if result.is_none() {
        println!("  ==> No trip found");
        return "{\"result\": \"not_found\"}".to_string();
    }

    let details = result.unwrap();

    let _access_result = trips.update_one(doc! {
        "trip_id": trip_id,
    }, doc! {
        "$set": {
            "last_accessed": DateTime::now(),
        }
    }, None).await;

    let json = format!(
        "{{\"result\": \"success\", \"details\": {} }}",
        doc! {
            "trip_id":    details.get_str("trip_id").unwrap(),
            "title": details.get_str("title").unwrap(),
            "currency": details.get("currency").unwrap(),
            "members": details.get_array("members").unwrap(),
        },
    );

    json.to_string()
}


// Records
#[post("/<trip_id>/form-submit?<item_title>&<amount>&<total>&<paid>&<payers>")]
async fn form_submit(trip_id: &str, item_title: &str, amount: f32, total: bool,
            paid: &str, payers: &str,
        ) -> &'static str {
    let db_ref = db::get_db().await;

    // Get trip members
    let trips = db_ref.collection("trips");
    let trip = trips.find_one(doc! {
        "trip_id": trip_id,
    }, None).await;
    if trip.is_err() {
        println!("  ==> Failed to get trip");
        return "{\"result\": \"no_trip\"}";
    }
    let trip = trip.unwrap().unwrap_or(doc! {});
    let members = trip.get_array("members").unwrap();

    let payers: Vec<&str> = payers.split(",").collect();
    let mut payers_sorted: Vec<&str> = Vec::new();
    for member in members {
        let member = member.as_str().unwrap();
        if payers.contains(&member) {
            payers_sorted.push(&member);
        }
    }

    // println!("------------------------------------------");
    // println!(" Form Submitted: {}",   trip_id);
    // println!("  -> Item = {}",        item_title);
    // println!("  -> Amount = {:.2}",   amount);
    // println!("  -> Total = {}",       total);
    // println!("  -> Paid Person = {}", paid);
    // println!("  -> Payers = {}",      payers_sorted.join(" | "));
    // println!("------------------------------------------");
    
    let records = db_ref.collection("records");
    let record = doc! {
        "trip_id": trip_id,
        "item": item_title,
        "amount": amount,
        "total": total,
        "paid": paid,
        "payers": payers_sorted,
        "time": DateTime::now()
    };
    let result = records.insert_one(
        record.clone(),
        None,
    ).await;

    if result.is_err() {
        println!("  ==> Failed to insert record");
        return "{\"result\": \"db_failed\"}";
    }

    println!("  ==> Inserted new record: {}", result.unwrap().inserted_id);

    "{\"result\": \"success\"}"
}

#[get("/<trip_id>/records")]
async fn get_records(trip_id: &str) -> String {
    let db_ref = db::get_db().await;
    let records = db_ref.collection::<Document>("records");
    let result = records.find(
        doc! {
            "trip_id": trip_id,
        },
        None,
    ).await;

    if result.is_err() {
        println!("  ==> Failed to get records");
        return "{\"result\": \"db_failed\"}".to_string();
    }

    let mut records: Vec<String> = [].to_vec();
    let mut cur = result.unwrap();
    while cur.advance().await.unwrap() {
        let record = cur.deserialize_current().unwrap();
        records.push(format!("{}", doc! {
            "record_id": record.get_object_id("_id").unwrap().to_string(),
            "timestamp": record.get_datetime("time").unwrap().timestamp_millis(),
            "item":      record.get("item").unwrap(),
            "amount":    record.get("amount").unwrap(),
            "total":     record.get("total").unwrap(),
            "paid":      record.get("paid").unwrap(),
            "payers":    record.get("payers").unwrap(),
        }).to_string());
    }
    // println!(" => Retreived records: {:?}", records.join(","));
    format!(
        "{{\"result\": \"success\", \"records\": [{}]}}",
        records.join(",")
    ).to_string()
}

#[post("/delete-record/<trip_id>/<record_id>")]
async fn delete_record(trip_id: &str, record_id: &str) -> String {
    let db_ref = db::get_db().await;
    let records = db_ref.collection::<Document>("records");

    let delete_record_result = records.delete_one(doc! {
        "_id":     ObjectId::parse_str(record_id).unwrap(),
        "trip_id": trip_id,
    }, None).await;

    if !delete_record_result.is_ok() {
        println!(" => Failed to delete record {}...", record_id);
        return format!(
            "{{\"result\": \"failed\"}}",
        ).to_string();
    }

    println!(" => Successfully deleted record {}...", record_id);
    format!(
        "{{\"result\": \"success\"}}",
    ).to_string()
}


// Payments
#[get("/<trip_id>/payments")]
async fn get_payments(trip_id: &str) -> String {
    let db_ref = db::get_db().await;
    let records = db_ref.collection::<Document>("records");
    let result = records.find(
        doc! {
            "trip_id": trip_id,
        },
        None,
    ).await;

    if result.is_err() {
        println!("  ==> Failed to get records");
        return "{\"result\": \"db_failed\"}".to_string();
    }

    let mut spent: HashMap<String, f64> = HashMap::new();
    let mut payments: Vec<String> = [].to_vec();
    let mut cur = result.unwrap();
    while cur.advance().await.unwrap() {
        let record = cur.deserialize_current().unwrap();
        let mut amount = record.get_f64("amount").unwrap();
        let total = record.get_bool("total").unwrap();
        let paid = record.get_str("paid").unwrap();
        let payers = record.get_array("payers").unwrap();

        if total {
            amount /= payers.len() as f64;
        }
        
        for i in payers {
            let payer = i.as_str().unwrap();
            spent.insert(
                payer.to_string(),
                spent.get(payer).unwrap_or(&0.0) + amount
            );
            spent.insert(
                paid.to_string(),
                spent.get(paid).unwrap_or(&0.0) - amount
            );
        }
    }

    let tmp = spent.clone().to_owned();
    for (i, _) in tmp.iter().sorted_by_key(|x| x.0) {
        for (j, _) in tmp.iter().sorted_by_key(|x| x.0) {
            let from_spent = spent.get(i).unwrap().to_owned();
            let to_spent   = spent.get(j).unwrap().to_owned();
            if from_spent <= 0.0 {
                break;
            }

            if to_spent < 0.0 {
                let amount = from_spent.min(-to_spent);
                spent.insert(
                    i.to_string(),
                    spent.get(i).unwrap_or(&0.0) - amount
                );
                spent.insert(
                    j.to_string(),
                    spent.get(j).unwrap_or(&0.0) + amount
                );

                payments.push(format!("{}", doc! {
                    "from":   i.to_string(),
                    "to":     j.to_string(),
                    "amount": amount,
                }));
            }
        }
    }

    format!(
        "{{\"result\": \"success\", \"payments\": [{}]}}",
        payments.join(","),
    ).to_string()
}


#[launch]
async fn rocket() -> _ {
    rocket::build().mount("/api", routes![
        root, create_trip, get_trip_details,
        form_submit, get_records, delete_record,
        get_payments,
    ])
}

