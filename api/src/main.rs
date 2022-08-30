use std::collections::HashMap;

#[macro_use] extern crate rocket;

#[get("/<_..>")]
fn hello() -> &'static str {
    "Hello, GoPaycation!"
}

#[post("/<trip_id>/form-submit?<item_title>&<amount>&<total>&<paid>&<payers>")]
fn form_submit(trip_id: &str, item_title: &str, amount: i32, total: bool,
            paid: &str, payers: Vec<String>,
        ) -> &'static str {
    println!("Submitted: {} ==> {}, {}", trip_id, item_title, payers.join(" | "));
    println!("------------------------------------------");
    "Success"
}

#[launch]
fn rocket() -> _ {
    rocket::build().mount("/api", routes![
        hello, form_submit,
    ])
}
