mod db;

use bson::{DateTime};
use bson::document::Document;
use mongodb::bson::doc;
#[macro_use] extern crate rocket;

#[get("/")]
fn root() -> &'static str {
    "GoPaycation API"
}

#[get("/<trip_id>/details")]
async fn get_trip_details(trip_id: &str) -> &'static str {
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
        return "{\"result\": \"db_failed\"}";
    }

    let result = result.unwrap();
    if result.is_none() {
        println!("  ==> No trip found");
        return "{\"result\": \"not_found\"}";
    }

    let details = result.unwrap();

    println!("  ==> Trip details: {}", details);

    let json = format!("{{\"result\": \"success\", \"details\": {} }}", &details).as_str();

    "{\"result\": \"success\"}"
}

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

#[launch]
async fn rocket() -> _ {
    rocket::build().mount("/api", routes![
        root, get_trip_details, form_submit,
    ])
}

