// Editable Studio-page text. Defaults live here; the admin can override each
// field, stored in the `settings` table under these keys. Values may contain
// simple <a href="…">links</a>, which render as-is on the page.

export interface StudioField {
  key: string;
  label: string;
  hint?: string;
}

export const STUDIO_FIELDS: StudioField[] = [
  { key: 'studio_bio_1', label: 'Bio — paragraph 1 (sidebar)' },
  {
    key: 'studio_bio_2',
    label: 'Bio — paragraph 2 (sidebar)',
    hint: 'Links use <a href="URL">text</a>. Keep those tags to preserve links.',
  },
  { key: 'studio_bio_3', label: 'Bio — paragraph 3 (sidebar)' },
  { key: 'studio_intro', label: 'Studio intro (top of main column)' },
  { key: 'studio_potter', label: 'Potter paragraph' },
];

export const STUDIO_DEFAULTS: Record<string, string> = {
  studio_bio_1:
    'I am a designer who builds things. It sounds straightforward and it really is. I start with a conversation — with myself or with a client — and progress to sketches and renderings before ever touching a material. Move neurons, then the pencil, then the saw. I believe that the boundaries between craft and art are fluid so that furniture can be more than functional and decorative, it can make you think and laugh. I try to take risks with every piece I design and make.',
  studio_bio_2:
    'Everyone has their own set of motivations. Here are some of mine. I spent two years in a woodworking shop watching and learning from one of the great woodworkers of the 20th century: <a href="https://en.wikipedia.org/wiki/Tage_Frid" target="_blank" rel="noopener">Tage Frid</a>. Wood is a great medium, but it is not everything, so I recently learned how to weld from a friend and sculptor <a href="https://www.walterboelke.com/index.html" target="_blank" rel="noopener">Walter Boeke</a>. My father taught me 2- and 3-point perspective when I was eight years old but I really learned to draw from <a href="https://www.bryonfitzpatrick.com/" target="_blank" rel="noopener">Bryon Fitzpatrick</a>, a.k.a., the drawing machine. <a href="https://en.wikipedia.org/wiki/Marc_Harrison" target="_blank" rel="noopener">Marc Harrison</a> helped me think of design in a much broader sense (Universal Design). Most have left this earth, but they left their mark.',
  studio_bio_3:
    'I have the advantage of living in two countries — the US and Germany — each with its own set of influences, ranging from Shaker furniture and early American arts and crafts to the German Bauhaus and the <a href="https://www.deutscher-werkbund.de/wir-im-dwb/basic-information-in-english/" target="_blank" rel="noopener">Werkbund</a>.',
  studio_intro:
    'My workshop is in a 19th century gambrel-roofed barn in Western Massachusetts that I share with bats, upstairs, and a dog, downstairs.',
  studio_potter:
    'I give wood shavings to a great potter, <a href="https://www.berkshirepotterscollective.org/aferril" target="_blank" rel="noopener">Anne Ferril</a>, who uses them to fire her pots. Here is one fired with black walnut, cherry, and oak shavings — a circular economy of artists.',
};
