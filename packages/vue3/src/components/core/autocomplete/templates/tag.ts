export default function tag(
  this: Tagify<Tagify.TagData>,
  tagData: Tagify.TagData,
  tagify: Tagify<Tagify.TagData>
): string {
  return `
    <tag title="${tagData.title || tagData.value}"
        contenteditable='false'
        spellcheck='false'
        tabIndex="${this.settings.a11y.focusableTags ? 0 : -1}"
        class="${this.settings.classNames.tag} 
          ${tagData.class ? tagData.class : ""}"
          ${this.getAttributes(tagData)}>
      <x title='' class="${
        this.settings.classNames.tagX
      }" role='button' aria-label='remove tag'></x>
      <div>
        <span class="${this.settings.classNames.tagText}">${
    tagData[this.settings.tagTextProp] || tagData.value
  }</span>
      </div>
    </tag>
`;
}
