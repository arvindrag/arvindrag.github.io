// function dark_mode_toggle() {
//   for (let i = 0; i < 10; i++) {
//     const lights = document.querySelectorAll(
//       "." + "lighten-" + i + ", ." + "darken-" + i
//     );
//     lights.forEach((n) => {
//       n.classList.toggle("lighten-" + i);
//       n.classList.toggle("darken-" + i);
//     });
//     document.querySelectorAll("input").forEach(i=>i.classList.toggle("white-text"))
//   }
// }
// darkmode = document.getElementById("darkmode");
// darkmode.addEventListener("click", dark_mode_toggle);

class Crumb {
  constructor(tags, text, before) {
    this.tags = tags;
    this.elem = CHIPR.genElementAndAttach(this);
    this.tags.container.insertBefore(this.elem, before);
    this.chip.tabIndex = 0;
    this.text.innerHTML = text;
    this.add_node(text)
    this.keymap();
  }
  add_node(text){
    console.log(">>", text)
    addNode(text)
    try{
      const prevnodeid = this.elem.previousElementSibling.object.text.innerText
      console.log("<-", prevnodeid)
      addEdge(prevnodeid, text)
    }catch(e){}
    
  }
  focus() {
    this.chip.focus();
    centerNode(this.text.innerText)
  }
  delete() {
    try {
      this.elem.previousElementSibling.object.focus();
    } catch (error) {
      try {
        this.elem.nextElementSibling.object.focus();
      } catch (error) {
        this.tags.editor(this.elem);
      }
    }
    this.elem.remove();
    this.tags.update_to_store();
  }
  keymap() {
    this.chip.addEventListener("keydown", (event) => {
      switch (event.key) {
        case "Enter":
          this.tags.editor(this.elem);
          break;
        case "Backspace":
          this.delete();
          break;
        case "ArrowUp":
          try {
            this.elem.previousElementSibling.object.focus();
          } catch (error) {}
          break;
        case "ArrowDown":
          try {
            this.elem.nextElementSibling.object.focus();
          } catch (error) {}
          break;
        default:
          M.toast({ html: "key!" + event.key });
      }
    });
  }
}

class Tags {
  constructor(tagger_id) {
    this.elem = document.getElementById(tagger_id);
    this.container = TAGS.genElementAndAppend(this.elem);
    this.input = INPUT.genElementAndAppend(this.container);
    this.input.tabIndex = 0;
    this.input.object = this.input;
    this.update_from_store();
    this.keymap();
  }
  editor(after) {
    this.container.insertBefore(this.input, after.nextElementSibling);
    this.input.focus();
  }
  update_from_store() {
    const tags = JSON.parse(localStorage.getItem("tags"));
    tags.forEach((t) => new Crumb(this, t, this.input));
  }
  update_to_store() {
    const tags = Array.from(this.container.children)
      .filter((t) => t.tagName == "DIV")
      .map((t) => t.object.text.innerText);
    localStorage.setItem("tags", JSON.stringify(tags));
  }
  keymap() {
    this.input.addEventListener("keydown", (event) => {
      switch (event.key) {
        case "Enter":
          new Crumb(this, this.input.value, this.input);
          this.input.value = "";
          this.input.scrollIntoView({ behavior: "smooth" });
          this.update_to_store();
          break;
        case "Backspace":
          if (this.input.value != "") {
            break;
          }
        case "ArrowUp":
          // try {
            this.input.previousElementSibling.object.focus();
            // this.input.remove();
          // } catch (error) {}
          break;
        case "ArrowDown":
          try {
            this.input.nextElementSibling.object.focus();
            this.input.remove();
          } catch (error) {}
          break;
        default:
        // M.toast({ html: "key!" + event.key });
      }
    });
  }
}

t = new Tags("tagger");
t.input.focus();
// dark_mode_toggle()