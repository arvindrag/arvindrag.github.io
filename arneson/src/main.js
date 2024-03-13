class Card {
  constructor(parent, text) {
    this.parent = parent;
    this.elem = CARD.genElementAndAttach(this);
    this.elem.card = this;
    this.setText(text);
    this.cardElem.addEventListener("click", () => {
      this.setFocus();
    });
    this.cardElem.addEventListener("dblclick", () => {
      this.edit();
    });
  }
  static genAppend(parent, text) {
    const card = new Card(parent, text);
    parent.elem.appendChild(card.elem);
    card.setFocus();
    return card;
  }
  static genAfter(after, parent, text) {
    const card = new Card(parent, text);
    after.after(card.elem);
    card.setFocus();
    return card;
  }
  setText(text) {
    this.text.innerHTML = text;
  }
  unFocus() {
    if (this.cardElem.classList.contains("purple")) {
      this.cardElem.classList.remove("purple");
    }
    if (!this.cardElem.classList.contains("red")) {
      this.cardElem.classList.add("red");
    }
  }
  setFocus() {
    if (this.parent.curFocus != null) {
      this.parent.curFocus.unFocus();
    }
    this.parent.curFocus = this;
    if (this.cardElem.classList.contains("red")) {
      this.cardElem.classList.remove("red");
    }
    if (!this.cardElem.classList.contains("purple")) {
      this.cardElem.classList.add("purple");
    }
  }
  focusNext() {
    if (this.elem.nextSibling != null && "card" in this.elem.nextSibling) {
      this.elem.nextSibling.card.setFocus();
    }
  }
  focusPrevious() {
    if (this.elem.previousSibling && "card" in this.elem.previousSibling) {
      this.elem.previousSibling.card.setFocus();
    }
  }
  edit() {
    this.parent.editModal.openWith(this.text);
  }
}
class EditModal {
  constructor(after) {
    this.elem = EDIT_MODAL.genElementAndAttach(this);
    after.after(this.elem);
    this.instance = M.Modal.init(this.elem);
    this.textElemRef = null;
    this.saveBtn.addEventListener("click", () => this.doSave());
  }
  doSave() {
    if (!this.textarea.value == "") {
      this.textElemRef.innerHTML = this.textarea.value;
    }
    this.textElemRef = null;
  }
  openWith(textElemRef) {
    this.textElemRef = textElemRef;
    this.textarea.value = textElemRef.innerHTML
    this.instance.open();
    this.textarea.focus();
    this.textarea.select();
  }
}
class CardsSet {
  constructor(elem_id) {
    this.elem = document.querySelector("#" + elem_id);
    this.curFocus = null;
    this.initKeyMap();
    this.editModal = new EditModal(this.elem);
  }
  initKeyMap() {
    const quietKeys = new Set([
      "ArrowDown",
      "ArrowUp",
      "ArrowLeft",
      "ArrowRight",
      "Enter",
    ]);
    document.addEventListener("keyup", (e) => {
      if (this.editModal.instance.isOpen) {
        if (e.key == "Enter") {
          this.editModal.doSave();
          this.editModal.instance.close();
          return;
        }
      } else {
        if (e.key == "ArrowUp") {
          this.curFocus.focusPrevious();
          return;
        }
        if (e.key == "ArrowDown") {
          this.curFocus.focusNext();
          return;
        }
        if (e.key == "Enter") {
          this.curFocus.edit();
          return;
        }
        if (e.key == "n") {
          M.toast({ html: "<b>n: new</b>" });
          const card = Card.genAfter(this.curFocus.elem, this, "And then...");
          card.edit();
          return;
        }
        M.toast({ html: "<b>" + e.key + "</b>" });
      }
    });
  }
  addCard(text) {
    const card = Card.genAppend(this, text);
  }
}
cardsSet = new CardsSet("cards");
cardsSet.addCard("Once upon a time...");
document.append();
