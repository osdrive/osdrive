use std::ops::Range;

use gpui::*;

use crate::state::{FocusSelection, State};

use super::{TableRow, open_node, render_titles};

const SCROLLBAR_THUMB_WIDTH: Pixels = px(5.);
const SCROLLBAR_THUMB_HEIGHT: Pixels = px(80.);

pub struct DataTable {
    state: Entity<State>,
    scroll: UniformListScrollHandle,
    /// The position in thumb bounds when dragging start mouse down.
    drag_position: Option<Point<Pixels>>,
}

impl DataTable {
    pub fn new(state: Entity<State>) -> Self {
        Self {
            state,
            scroll: UniformListScrollHandle::new(),
            drag_position: None,
        }
    }

    fn table_bounds(&self) -> Bounds<Pixels> {
        self.scroll.0.borrow().base_handle.bounds()
    }

    fn scroll_top(&self) -> Pixels {
        self.scroll.0.borrow().base_handle.offset().y
    }

    fn scroll_height(&self) -> Pixels {
        self.scroll
            .0
            .borrow()
            .last_item_size
            .unwrap_or_default()
            .contents
            .height
    }

    fn render_scrollbar(&mut self, _: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let scroll_height = self.scroll_height();
        let table_bounds = self.table_bounds();
        let table_height = table_bounds.size.height;
        if table_height == px(0.) {
            return div().id("scrollbar");
        }

        let percentage = -self.scroll_top() / scroll_height;
        let offset_top = (table_height * percentage).clamp(
            px(4.),
            (table_height - SCROLLBAR_THUMB_HEIGHT - px(4.)).max(px(4.)),
        );
        let entity = cx.entity();
        let scroll_handle = self.scroll.0.borrow().base_handle.clone();

        div()
            .id("scrollbar")
            .absolute()
            .top(offset_top)
            .right_1()
            .h(SCROLLBAR_THUMB_HEIGHT)
            .w(SCROLLBAR_THUMB_WIDTH)
            .bg(rgba(0x00000026))
            .hover(|this| this.bg(rgba(0x00000040)))
            .rounded_lg()
            .child(
                canvas(
                    |_, _, _| (),
                    move |thumb_bounds, _, window, _| {
                        window.on_mouse_event({
                            let entity = entity.clone();
                            move |ev: &MouseDownEvent, _, _, cx| {
                                if !thumb_bounds.contains(&ev.position) {
                                    return;
                                }

                                entity.update(cx, |this, _| {
                                    this.drag_position = Some(
                                        ev.position - thumb_bounds.origin - table_bounds.origin,
                                    );
                                })
                            }
                        });

                        window.on_mouse_event({
                            let entity = entity.clone();
                            move |_: &MouseUpEvent, _, _, cx| {
                                entity.update(cx, |this, _| {
                                    this.drag_position = None;
                                })
                            }
                        });

                        window.on_mouse_event(move |ev: &MouseMoveEvent, _, _, cx| {
                            if !ev.dragging() {
                                return;
                            }

                            let Some(drag_pos) = entity.read(cx).drag_position else {
                                return;
                            };

                            let inside_offset = drag_pos.y;
                            let percentage = ((ev.position.y - table_bounds.origin.y
                                + inside_offset)
                                / (table_bounds.size.height))
                                .clamp(0., 1.);

                            let offset_y = ((scroll_height - table_bounds.size.height)
                                * percentage)
                                .clamp(px(0.), scroll_height - SCROLLBAR_THUMB_HEIGHT);
                            scroll_handle.set_offset(point(px(0.), -offset_y));
                            cx.notify(entity.entity_id());
                        })
                    },
                )
                .size_full(),
            )
    }
}

impl Render for DataTable {
    fn render(&mut self, window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let entity_id = cx.entity_id();

        // let selected = cx.new(|cx| {
        //     cx.observe(&self.state, |this, state, cx| {}).detach();

        //     None::<usize>
        // });

        cx.subscribe(&self.state, |this, state, _: &FocusSelection, cx| {
            let selection = state.read(cx).selected();
            if let Some(selection) = selection {
                this.scroll.scroll_to_item(selection, ScrollStrategy::Top);
            }
            cx.notify();
        })
        .detach();

        div()
            .bg(gpui::white())
            .text_sm()
            .size_full()
            .flex()
            .flex_col()
            .child(
                div()
                    .flex()
                    .flex_col()
                    .flex_1()
                    .overflow_hidden()
                    // .rounded_sm()
                    .child(render_titles())
                    .child(
                        div()
                            .relative()
                            .size_full()
                            .child(
                                // TODO: Is length reactive
                                uniform_list(
                                    ("items", entity_id),
                                    self.state.read(cx).nodes().len(),
                                    {
                                        let state = self.state.clone();
                                        move |range: Range<usize>, _, cx| {
                                            let mut items =
                                                Vec::with_capacity(range.end - range.start);
                                            let nodes = state.read(cx).nodes().to_vec();
                                            for i in range {
                                                if let Some(node) = nodes.get(i).cloned() {
                                                    let s = state.clone();
                                                    items.push(
                                                        TableRow::new(
                                                            i,
                                                            node.clone(),
                                                            s.read(cx)
                                                                .selected()
                                                                .map(|s| s == i)
                                                                .unwrap_or(false),
                                                        )
                                                        .on_click(move |event, _, cx| {
                                                            if event.click_count() == 1 {
                                                                s.update(
                                                                    cx,
                                                                    |s: &mut State, cx| {
                                                                        s.set_selection(cx, i)
                                                                    },
                                                                );
                                                            } else {
                                                                let modifiers = event.modifiers();
                                                                let modifier = modifiers.platform
                                                                    || modifiers.shift; // TODO: Make this better

                                                                open_node(&s, cx, &node, modifier);
                                                            }
                                                        }),
                                                    );
                                                }
                                            }

                                            items
                                        }
                                    },
                                )
                                .size_full()
                                .track_scroll(self.scroll.clone()),
                            )
                            .child(self.render_scrollbar(window, cx)),
                    ),
            )
    }
}
