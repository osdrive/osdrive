use std::io;

use anyhow::Context as _;
use clap::{CommandFactory, FromArgMatches, Parser, Subcommand};
use gpui::*;

mod assets;
mod components;
mod file_provider;
mod index;
mod provider_window;
mod state;
mod window;

actions!(example, [QuitApp]);

#[derive(Parser, Debug)]
#[command(name = "opendrive")]
#[command(version)]
struct Cli {
    #[command(subcommand)]
    command: Option<Command>,
}

#[derive(Subcommand, Debug)]
enum Command {
    Gui,
    Index,
}

fn main() -> anyhow::Result<()> {
    let is_gui_launch_mode = std::env::var("OPENDRIVE_LAUNCH_MODE").ok().as_deref() == Some("gui");

    let cli = Cli::from_arg_matches(
        &Cli::command()
            .allow_external_subcommands(is_gui_launch_mode)
            .ignore_errors(is_gui_launch_mode)
            .try_get_matches()?,
    )?;

    match cli.command {
        Some(Command::Gui) => run_gui(),
        None if is_gui_launch_mode => run_gui(),
        Some(Command::Index) => run_index().context("failed to build index")?,
        None => {
            let mut command = Cli::command();
            command.print_help()?;
            println!();
        }
    }

    Ok(())
}

fn run_index() -> io::Result<()> {
    println!("Indexing...");
    let summary = index::index_default_volume()?;

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

fn run_gui() {
    Application::new()
        .with_assets(assets::Assets)
        .run(|cx: &mut App| {
            cx.bind_keys([
                // Window actions
                KeyBinding::new("cmd-q", QuitApp, None),
                KeyBinding::new("cmd-w", window::CloseWindow, None),
                // Input
                KeyBinding::new("backspace", components::Backspace, None),
                KeyBinding::new("delete", components::Delete, None),
                KeyBinding::new("left", components::Left, None),
                KeyBinding::new("right", components::Right, None),
                KeyBinding::new("shift-left", components::SelectLeft, None),
                KeyBinding::new("shift-right", components::SelectRight, None),
                KeyBinding::new("cmd-a", components::SelectAll, None),
                KeyBinding::new("cmd-v", components::Paste, None),
                KeyBinding::new("cmd-c", components::Copy, None),
                KeyBinding::new("cmd-x", components::Cut, None),
                KeyBinding::new("home", components::Home, None),
                KeyBinding::new("end", components::End, None),
                KeyBinding::new("ctrl-cmd-space", components::ShowCharacterPalette, None),
            ]);

            cx.on_action(|_: &QuitApp, cx| cx.quit());
            cx.on_window_closed(|cx| {
                if cx.windows().is_empty() {
                    cx.quit();
                }
            })
            .detach();

            cx.open_window(
                WindowOptions {
                    focus: true,
                    window_bounds: Some(WindowBounds::Windowed(Bounds::centered(
                        None,
                        size(px(1280.0), px(1000.0)),
                        cx,
                    ))),
                    ..Default::default()
                },
                |window, cx| {
                    cx.activate(false);
                    cx.new(|cx| window::MainWindow::init(cx, window))
                },
            )
            .unwrap();

            cx.open_window(
                WindowOptions {
                    focus: false,
                    titlebar: Some(TitlebarOptions {
                        title: Some("File Provider".into()),
                        ..Default::default()
                    }),
                    window_bounds: Some(WindowBounds::Windowed(Bounds::centered(
                        None,
                        size(px(420.0), px(220.0)),
                        cx,
                    ))),
                    ..Default::default()
                },
                |_, cx| cx.new(|_| provider_window::ProviderWindow::init()),
            )
            .unwrap();

            // let view = window.update(cx, |_, _, cx| cx.entity()).unwrap();
            // cx.observe_keystrokes(move |ev, _, cx| {
            //     view.update(cx, |view, cx| {
            //         // view.recent_keystrokes.push(ev.keystroke.clone());
            //         cx.notify();
            //     })
            // })
            // .detach();
            // cx.on_keyboard_layout_change({
            //     move |cx| {
            //         window.update(cx, |_, _, cx| cx.notify()).ok();
            //     }
            // })
            // .detach();

            // TODO
            // window
            //     .update(cx, |view, window, cx| {
            //         window.focus(&view.text_input.focus_handle(cx));
            //         cx.activate(true);
            //     })
            //     .unwrap();
        });
}
