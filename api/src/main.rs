mod db;

#[macro_use] extern crate rocket;

#[get("/")]
fn root() -> &'static str {
    "GoPaycation API"
}

#[post("/<trip_id>/form-submit?<item_title>&<amount>&<total>&<paid>&<payers>")]
async fn form_submit(trip_id: &str, item_title: &str, amount: f32, total: bool,
            paid: &str, payers: &str,
        ) -> &'static str {
    let payers: Vec<&str> = payers.split(",").collect();
    println!("------------------------------------------");
    println!(" Form Submitted: {}",   trip_id);
    println!("  -> Item = {}",        item_title);
    println!("  -> Amount = {:.2}",      amount);
    println!("  -> Total = {}",       total);
    println!("  -> Paid Person = {}", paid);
    println!("  -> Payers = {}",      payers.join(" | "));
    println!("------------------------------------------");
    
    let db_ref = db::get_db().await;
    println!("database name = {}", db_ref.name());
    
    "{\"result\": \"success\"}"
}

#[launch]
async fn rocket() -> _ {
    rocket::build().mount("/api", routes![
        root, form_submit,
    ])
}

