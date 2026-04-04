use od_db::Db;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let path = std::env::args_os()
        .nth(1)
        .ok_or("usage: cargo run -p od-db --example print_paths -- <snapshot>")?;

    let db = Db::open(path)?;
    for id in 0..db.node_count() as u32 {
        let path = db.path_bytes(id)?;
        println!("{}", String::from_utf8_lossy(path.as_ref()));
    }

    Ok(())
}
