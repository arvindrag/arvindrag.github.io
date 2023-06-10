function createAndAppendElem(parent, tag = "div", classes = [], text = '') {
  let elem = document.createElement(tag)
  classes.split(' ').forEach((c) => elem.classList.add(c))
  elem.textContent = text
  parent.appendChild(elem)
  return elem
}

class E {
  static elem(parent, tag = "div", classes = [], text = '') {
      let elem = document.createElement(tag)
      classes.split(' ').forEach((c) => elem.classList.add(c))
      elem.textContent = text
      parent.appendChild(elem)
      return elem
  }
  static div(parent, classes = [], text = '') {
      return E.elem(parent, "div", classes, text)
  }
  static a(parent, classes = [], text = '') {
      return E.elem(parent, "a", classes, text)
  }
  constructor(color = "red") {
      this.color = " "+"color"+" "
  }

}

class Chunk {
  constructor(set_elem, text = 'Something') {
      this.set_elem = set_elem
      this.text = text
      this.elem = createAndAppendElem(this.set_elem, "div", "btn no-uppercase btn-large waves-effect waves-light red lighten-2")
      let row1 = createAndAppendElem(this.elem, "div", "row")
      this.texts = createAndAppendElem(row1, "div", "col")
      this.input = createAndAppendElem(this.texts, "input", "hide white-text")
      this.label = createAndAppendElem(this.texts, "div", "row")
      this.label.innerHTML = this.text
      this.buttons = createAndAppendElem(row1, "div", "col hide")
      this.addb = createAndAppendElem(this.buttons, "a", "btn-floating waves-effect waves-light red tiny")
      createAndAppendElem(this.addb, "i", "material-icons tiny", "add")
      this.delb = createAndAppendElem(this.buttons, "a", "btn-floating waves-effect waves-light red tiny")
      createAndAppendElem(this.delb, "i", "material-icons tiny", "delete")
      this.left = createAndAppendElem(this.buttons, "a", "btn-floating waves-effect waves-light red tiny")
      createAndAppendElem(this.left, "i", "material-icons tiny", "chevron_left")
      this.right = createAndAppendElem(this.buttons, "a", "btn-floating waves-effect waves-light red tiny")
      createAndAppendElem(this.right, "i", "material-icons tiny", "chevron_right")

      this.elem.addEventListener("click", () => {
          this.startEdit()
      })

      document.addEventListener('mouseup', (e) => {
          if (!this.elem.contains(e.target)) {
              this.endEdit()
          }
      });

      this.addb.addEventListener("click", () => {
          let chunk = new Chunk(this.elem, "And then.. ")
          this.elem.after(chunk.elem)
          console.log()
      })
      
      this.left.addEventListener("click", () => {
          if(this.elem.previousSibling !== null) {
              this.elem.previousSibling.before(this.elem)
          }
      })
      this.right.addEventListener("click", () => {
          if(this.elem.nextSibling !== null) {
              this.elem.before(this.elem.nextSibling)
          }
      })        

      this.edit = false
  }
  startEdit() {
      if (!this.edit) {
          this.input.value = this.label.innerHTML
          this.input.classList.toggle("hide");
          this.label.classList.toggle("hide");
          this.buttons.classList.toggle("hide");
          this.edit = !this.edit
          this.input.focus();
          this.input.select();
      }
  }    
  endEdit() {
      if (this.edit) {
          this.text = this.input.value
          this.label.innerHTML = this.text
          this.input.classList.toggle("hide");
          this.label.classList.toggle("hide");
          this.buttons.classList.toggle("hide");
          this.edit = !this.edit
      }
  }
}

class ChunkSet {
  constructor(container_elem) {
      this.set = []
      this.container_elem = container_elem
      this.elem = createAndAppendElem(this.container_elem, "div", "row yellow white-text center-align myscroll")
      this.pos = 0
  }
  addChunk() {
      let chunk = new Chunk(this.elem, "s" + this.pos)
      this.set.splice(this.pos, 0, chunk);
      this.pos++
  }
}

class ChunkSetsContainer {
  constructor(container_elem) {
      this.sets = []
      this.elem = container_elem
      this.main = 0
  }
  addChunkSet() {
      this.sets.push(new ChunkSet(this.elem))
  }
  clear() {
      this.elem.textContent = ''
  }
}
let chunkSetsContainer = new ChunkSetsContainer(document.querySelectorAll("#tieredchunks")[0]);
chunkSetsContainer.addChunkSet()
chunkSetsContainer.sets[0].addChunk()
console.log(chunkSetsContainer.elem)
