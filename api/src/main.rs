mod db;

use bson::DateTime;
use bson::document::Document;
use mongodb::bson::doc;
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

    let result = trips.insert_one(
        doc! {
            "trip_id":  trip_id.clone(),
            "title":    trip_title,
            "currency": currency,
            "members":  members,
        },
        None,
    ).await;

    if result.is_err() {
        return "{\"result\": \"db_failed\"}".to_string();
    }

    let json = format!("{{
        \"result\": \"success\",
        \"trip_id\": \"{}\"
    }}", trip_id);
    json.to_string()
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

    println!("  ==> Trip details: {}", details);

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
    let payers: Vec<&str> = payers.split(",").collect();
    println!("------------------------------------------");
    println!(" Form Submitted: {}",   trip_id);
    println!("  -> Item = {}",        item_title);
    println!("  -> Amount = {:.2}",   amount);
    println!("  -> Total = {}",       total);
    println!("  -> Paid Person = {}", paid);
    println!("  -> Payers = {}",      payers.join(" | "));
    println!("------------------------------------------");
    
    let db_ref = db::get_db().await;
    let records = db_ref.collection("records");
    let record = doc! {
        "trip_id": trip_id,
        "item": item_title,
        "amount": amount,
        "total": total,
        "paid": paid,
        "payers": payers,
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
        println!(" => Retreived record: {:?}", record);
        records.push(format!("{}", doc! {
            "timestamp": record.get_datetime("time").unwrap().timestamp_millis(),
            "item":      record.get("item").unwrap(),
            "amount":    record.get("amount").unwrap(),
            "total":     record.get("total").unwrap(),
            "paid":      record.get("paid").unwrap(),
            "payers":    record.get("payers").unwrap(),
        }).to_string());
    }
    format!(
        "{{\"result\": \"success\", \"records\": [{}]}}",
        records.join(",")
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

    let tmp = spent.clone();
    for i in tmp.keys() {
        for j in tmp.keys() {
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
        form_submit, get_records,
        get_payments,
    ])
}

