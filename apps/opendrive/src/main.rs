use std::io;

fn main() -> io::Result<()> {
    println!("Indexing...");
    let summary = opendrive::index_default_volume()?;

    println!(
        "dirs={} files={} persisted={} nodes={} index_took={:?} stats_took={:?}",
        summary.dirs,
        summary.files,
        summary.persisted,
        summary.nodes,
        summary.index_took,
        summary.stats_took,
    );

    Ok(())
}
