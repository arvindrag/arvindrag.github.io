class Card {
  constructor(parent, text, tags) {
    this.elem = CARD.genElementAndAttach(this);
    this.elem.card = this;
    this.parent = parent;
    this.tags = tags;
    this.setText(text);
    this.cardElem.addEventListener("click", () => {
      this.setFocus();
    });
    this.cardElem.addEventListener("dblclick", () => {
      this.edit();
    });
  }
  static genAppend(parent, text, tags) {
    const card = new Card(parent, text, tags);
    parent.elem.appendChild(card.elem);
    card.setFocus();
    return card;
  }
  genAfter(parent, text) {
    const card = new Card(parent, text, this.tags.slice(0));
    this.elem.after(card.elem);
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
    this.parent.updateTags(this.tags);
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
    this.parent.editTextModal.open(this.text.innerHTML, (txt) => {
      this.text.innerHTML = txt;
    });
  }
  editTags() {
    this.parent.editTagsModal.open(this.tags, (tags) => {
      this.tags = tags;
      this.setFocus();
    });
  }
}
class EditTagsModal {
  constructor(parent) {
    this.elem = EDIT_TAGS_MODAL.genElementAndAttachAppend(parent, this);
    this.instance = M.Modal.init(this.elem);
    this.textElemRef = null;
    this.saveBtn.addEventListener("click", () => {
      this.doSave();
    });
  }
  doSave() {
    console.log(this.chipsElem.querySelector(".input"));
    this.onSaveCallBack(
      this.chips.chipsData.map((d) => {
        return d.tag;
      })
    );
    this.instance.close();
    this.onSaveCallBack = null;
  }
  open(init_tags, callback) {
    this.chips = M.Chips.init(this.chipsElem, {
      data: init_tags.map((t) => {
        return { tag: t };
      }),
    });
    this.onSaveCallBack = callback;
    this.instance.open();
    const input = this.chipsElem.querySelector(".input");
    input.focus();
  }
}
class EditTextModal {
  constructor(parent) {
    this.elem = EDIT_TEXT_MODAL.genElementAndAttachAppend(parent, this);
    // after.after(this.elem);
    this.instance = M.Modal.init(this.elem);
    this.textElemRef = null;
    this.saveBtn.addEventListener("click", () => this.doSave());
  }
  doSave() {
    if (!this.textarea.value == "") {
      this.onSaveCallBack(this.textarea.value);
    }
    this.onSaveCallBack = null;
  }
  open(init_text, callback) {
    this.textarea.value = init_text;
    this.onSaveCallBack = callback;
    this.instance.open();
    this.textarea.focus();
    this.textarea.select();
  }
}
class CardsSet {
  constructor(parent_elem) {
    this.elem = CARDS_SET.genElementAndAttach();
    this.elem.cardsSet = this;
    this.curFocus = null;
    this.editTextModal = new EditTextModal(parent_elem);
    this.editTagsModal = new EditTagsModal(parent_elem);
    const active_tags_div = document.querySelector("#active_tags");
    this.tagsElem = ACTIVE_TAGS.genElementAndAttachAppend(
      active_tags_div,
      this
    );
  }
  keyMap(e) {
    if (e.key == "Shift") {
      return
    }
    if (this.editTextModal.instance.isOpen) {
      if (e.key == "Enter") {
        console.log("enter on text");
        this.editTextModal.doSave();
        this.editTextModal.instance.close();
        return;
      }
    } else if (this.editTagsModal.instance.isOpen) {
      if (e.key == "Enter") {
        console.log("enter on tags");
        this.editTagsModal.doSave();
        this.editTagsModal.instance.close();
        return;
      }
    } else {
      if (e.key == "ArrowUp") {
        this.curFocus.focusPrevious();
        return;
      }
      if (e.key == "ArrowDown") {
        if (!e.shiftKey) {
          M.toast({ html: "<b>down: next</b>" });
          this.curFocus.focusNext();
        } else {
          M.toast({ html: "<b>shift+down: new</b>" });
          this.curFocus.genAfter(this, "And then...").edit();
        }
        return;
      }
      if (e.key == "ArrowRight") {
        if (!e.shiftKey) {
          M.toast({ html: "<b>right: into</b>" });
          // this.curFocus.focusNext();
        } else {
          M.toast({ html: "<b>shift+right: subtree</b>" });
          // this.curFocus.genAfter(this, "And then...").edit();
        }
        return;
      }
      if (e.key == "Enter") {
        console.log("enter on nothing");
        M.toast({ html: "<b>enter: edit</b>" });
        this.curFocus.edit();
        return;
      }
      if (e.key == "n") {
        M.toast({ html: "<b>n: new</b>" });
        this.curFocus.genAfter(this, "And then...").edit();
        return;
      }      
      if (e.key == "t") {
        M.toast({ html: "<b>t: tags</b>" });
        this.curFocus.editTags();
        return;
      }
      M.toast({ html: "<b>" + e.key + "</b>" });
    }
  }
  updateTags(tags) {
    this.tags.innerHTML = tags
      .map((t) => {
        return '<div class="row">#' + t.trim() + "</div>";
      })
      .join("\n");
  }
  addCard(text) {
    const card = Card.genAppend(this, text, ["notmuch"]);
  }
}
class CardSetTree {
  constructor(elem) {
    this.elem = elem;
    this.root = new CardsSet(this.elem);
    this.elem.appendChild(this.root.elem);
    this.focus = this.root
    document.addEventListener("keyup", (e) => {
      this.focus.keyMap(e);
    });
  }
}
const tree = new CardSetTree(document.querySelector("#cards"));
tree.root.addCard("Once upon a time...");

// cardsSet = new CardsSet("cards");
// cardsSet.addCard("Once upon a time...");
// document.append();

