use gpui::{
    App, ImageSource, IntoElement, RenderOnce, Resource, SharedString, Styled, Window, black, img,
};

#[derive(IntoElement)]
pub enum Icon {
    PhFile,
    PhFolder,
}

impl RenderOnce for Icon {
    fn render(self, _window: &mut Window, _: &mut App) -> impl IntoElement {
        let svg = match self {
            Icon::PhFile => include_str!("../../icons/PhFile.svg"),
            Icon::PhFolder => include_str!("../../icons/PhFolder.svg"),
        };

        img(ImageSource::Resource(Resource::Embedded(
            SharedString::new_static(svg),
        )))
        .text_color(black())
        .size_8()
    }
}
