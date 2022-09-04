use mongodb::{Client, Database, options::ClientOptions};
use std::error::Error;

pub static mut DB: Option<Database> = None;

pub async fn init_db() -> Result<(), Box<dyn Error>> {
   let client_options = ClientOptions::parse("mongodb://localhost:27017").await?;

   let client = Client::with_options(client_options)?;

   // println!("Databases:");
   // for name in client.list_database_names(None, None).await? {
   //    println!("- {}", name);
   // }
   unsafe {
       DB = Some(client.database("holipaycation_db"));
   }

   Ok(())
}

pub async fn get_db() -> Database {
    unsafe {
        if DB.is_none() {
            init_db().await.ok();
        }
        return DB.clone().unwrap();
    }
}
