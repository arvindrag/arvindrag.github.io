// ---------------------------
// Global constants
// ---------------------------
const lookupColorArray = [
  "pink",
  "purple",
  "deep-purple",
  "indigo",
  "blue",
  "light-blue",
  "cyan",
  "teal",
  "green",
  "light-green",
  "lime",
  "yellow",
  "amber",
  "orange",
  "deep-orange",
  "brown",
  "grey",
  "blue-grey",
];

// ---------------------------
// Logic wrapping classes
// ---------------------------


class ItemPromptModal {
  static subElemById(element, id) {
    let t = element.querySelectorAll("#" + id);
    if (t.length > 0) {
      return t[0];
    }
    return null;
  }
  constructor(id, dataset) {
    this.element = ItemPromptModal.subElemById(document, id);
    this.text = ItemPromptModal.subElemById(this.element, id + "-text");
    this.details = ItemPromptModal.subElemById(this.element, id + "-details");
    this.save = ItemPromptModal.subElemById(this.element, id + "-save");
    this.itemUnderEdit = null;
    this.color = null;
    this.dataset = dataset;
    this.modal = M.Modal.init(this.element, {});
    this.save.addEventListener("click", () => {
      this.updateItem();
    });
    this.text.onkeypress = (event) => {
      const keyCode = event.keyCode;
      if (keyCode === 13) {
        this.updateItem();
        this.modal.close();
      }
    };
    this.details.onkeypress = (event) => {
      const keyCode = event.keyCode;
      if (keyCode === 13) {
        this.updateItem();
        this.modal.close();
      }
    };
  }
  updateToItemExtras(){}
  updateItem() {
    if (this.itemUnderEdit !== null) {
      this.itemUnderEdit.content = this.text.value;
      this.itemUnderEdit.details = this.details.value;
      if ("start" in this.itemUnderEdit) {
        this.itemUnderEdit.start = Date.parse(
          this.itemUnderEdit.start.toString()
        );
      }
      if ("end" in this.itemUnderEdit) {
        this.itemUnderEdit.end = Date.parse(this.itemUnderEdit.end.toString());
      }
      this.updateToItemExtras()
      this.dataset.updateOnly(this.itemUnderEdit);
      this.itemUnderEdit = null;
      this.setModalColor();
    }
  }
  getModalColor() {
    return lookupColorArray[this.itemUnderEdit.group - 1];
  }
  setModalColor() {
    lookupColorArray.forEach((c) => {
      this.element.classList.remove(c)
      this.element.querySelectorAll(".btn").forEach((e) => {
        e.classList.remove(c);
      });
      this.color = null;
    })
    if (this.itemUnderEdit !== null) {
      let color = this.getModalColor();
      this.element.classList.add(color);
      this.element.querySelectorAll(".btn").forEach((e) => {
        e.classList.add(color);
      });
    }
  }
  updateFromItem(item){
    this.text.value = item.content;
    this.details.value = item.details;
  }
  editItem(item) {
    this.itemUnderEdit = item;
    this.updateFromItem(item)
    this.setModalColor();
    this.modal.open();
    this.text.focus();
    this.text.select();
  }
}
class Card {
  shuffle(){
    this.draw(Math.floor(Math.random() * 22)+1)
  }
  draw(num){
    this.num = num
    this.elem.src = this.root + this.num + ".svg"
  }
  constructor(elem, num = 1){
    this.root = "images/tarot/"
    this.elem = elem
    this.num = num
    this.elem.addEventListener("click", () => {
      this.shuffle()
    });
  }
}

class GroupPromptModal extends ItemPromptModal {
  constructor(id, dataset) {
    super(id, dataset);
    this.card = new Card(ItemPromptModal.subElemById(this.element, id + "-svg"));
    this.del = ItemPromptModal.subElemById(this.element, id + "-del");
    this.del.addEventListener("click", () => {
      this.dataset.remove(this.itemUnderEdit.id);
    });
  }
  updateFromItem(item){
    this.text.value = item.content;
    this.details.value = item.details;
    this.card.draw(item.card);
  }
  updateToItemExtras(item){
    this.itemUnderEdit.card = this.card.num;
  }
  getModalColor() {
    return lookupColorArray[this.itemUnderEdit.id - 1];
  }
}
class TimelineWrapper {
  static addClassNamesToGroups(groups) {
    groups.forEach((g) => {
      g.className = lookupColor(g.id - 1);
    });
  }
  constructor() {
    this.groups = new vis.DataSet();
    this.items = new vis.DataSet();
    this.itemModal = new ItemPromptModal("item-prompt-modal", this.items);
    this.groupModal = new GroupPromptModal("group-prompt-modal", this.groups);
    let container = document.getElementById("visualization");
    this.state = 0
    this.options = {
      editable: true, // default for all items
      zoomable: false,
      horizontalScroll: true,
      snap: null,
      groupTemplate: function(grp) {
        let elem = document.createElement("a");
        "waves-effect waves-light lighten-2 btn".split(' ').forEach(
          (c) => elem.classList.add(c)
        );
        elem.classList.add(lookupColorArray[grp.id - 1]);
        elem.classList.add();
        elem.innerHTML = grp.content;
        return elem;
      },
      groupEditable: {
        add: true,
        remove: true,
        order: true
      },
      format: {
        minorLabels: {
          millisecond: "",
          second: "",
          minute: "",
          hour: "",
          weekday: "",
          day: "",
          week: "[Ch] M [Sc] w",
          month: "[Ch] M",
          year: "[Book] YY",
        },
        majorLabels: {
          millisecond: "",
          second: "",
          minute: "",
          hour: "",
          weekday: "",
          day: "[Chapter] M [Scene] w",
          week: "[Chapter] M [Scene] w",
          month: "[Book] YY [Chapter] M",
          year: "[Book] YY",
        },
      },
      template: function(item, element, data) {
        element.classList.add(lookupColorArray[item.group - 1]);
        element.classList.add("white-text");
        element.classList.add("lighten-2");
        return item.content;
      },
    };
    this.timeline = new vis.Timeline(
      container,
      this.items,
      this.groups,
      this.options
    );
    this.timeline.on("doubleClick", (e) => {
      switch (e.what) {
        case "item":
          if (e.item !== null) {
            let item = this.items.get(e.item);
            this.itemModal.editItem(item);
          }
          break;
        case "group-label":
          if (e.group !== null) {
            let group = this.groups.get(e.group);
            if (this.state == 0) {
              M.toast({
                html: "Viewing " + group.content + "!"
              });
              this.groups.forEach((group_i) => {
                group_i.visible = (group_i.id == group.id)
                this.groups.update(group_i);
              })
              this.state = 1
            } else {
              this.groupModal.editItem(group);
            }
          }
          default:
      }
    });
  }
  clear() {
    this.groups.clear();
    this.items.clear();
  }
  loadData(data) {
    this.items.clear();
    this.items.add(data.items);
    this.groups.clear();
    this.groups.add(data.groups);
  }
  saveData() {
    let itemdata = this.items.get({
      fields: ["id", "start", "content", "details", "group"], // output the specified fields only
      type: {
        start: "Date", // convert the date fields to Date objects
        content: "String",
        group: "int", // convert the group fields to Strings
        details: "String",
      },
    });
    let groupdata = this.groups.get({
      fields: ["id", "content", "details", "card", "order"], // output the specified fields only
      type: {
        order: "int",
        id: "int", // convert the date fields to Date objects
        content: "String", // convert the group fields to Strings
        details: "String",
        card: "int"
      },
    });
    return {
      groups: groupdata,
      items: itemdata
    };
  }
  addGroup() {
    let newid = 1;
    let newindex = 1;
    if (this.groups.length > 0) {
      newid = this.groups.max("id").id + 1;
    }
    if (this.groups.length > 0) {
      newindex = this.groups.max("order").order + 1;
    }
    this.groups.add({
      id: newid,
      content: "person_" + newid,
      visible: true,
      order: newindex,
      card: 1,
      details: "..."
    });
  }
  resetView() {
    this.groups.forEach((group_i) => {
      group_i.visible = true;
      this.groups.update(group_i);
    })
    this.state = 0
    this.timeline.fit(6000);
  }
}

// ---------------------------
// Declares
// ---------------------------
const timelineWrapper = new TimelineWrapper();

// ---------------------------
// Listeners
// ---------------------------

document.getElementById("edit-btn-char").addEventListener("click", () => {
  timelineWrapper.addGroup();
  M.toast({
    html: "New character added!"
  });
});
document.getElementById("edit-btn-zoom-in").addEventListener("click", () => {
  timelineWrapper.timeline.zoomIn(0.2);
});
document.getElementById("edit-btn-zoom-out").addEventListener("click", () => {
  timelineWrapper.timeline.zoomOut(0.2);
});
document.getElementById("edit-btn-clear").addEventListener("click", () => {
  timelineWrapper.clear();
  M.toast({
    html: "Clearing all items!"
  });
});
document.getElementById("edit-btn-clear").addEventListener("click", () => {
  timelineWrapper.clear();
  M.toast({
    html: "Clearing all items ()!"
  });
});
document.getElementById("edit-btn-reset").addEventListener("click", () => {
  timelineWrapper.resetView();
})
document.getElementById("footer-btn-save").addEventListener("click", () => {
  let data = timelineWrapper.saveData();
  localStorage.setItem("itemdata", JSON.stringify(data.items));
  localStorage.setItem("groupdata", JSON.stringify(data.groups));
  M.toast({ html: "Data saved!" });
});
document.getElementById("footer-btn-load").addEventListener("click", () => {
  let itemdata = JSON.parse(localStorage.getItem("itemdata")).filter(
    (d) => d.id !== null && d.start !== null
  );
  let groupdata = JSON.parse(localStorage.getItem("groupdata")).filter(
    (d) => d.id !== null && d.start !== null
  );
  timelineWrapper.loadData({
    groups: groupdata,
    items: itemdata
  });
  M.toast({
    html: "Loading data!"
  });
  timelineWrapper.resetView()
});

document.getElementById("footer-btn-download").addEventListener("click", () => {
  M.toast({
    html: "Downloading data!"
  });
  filename = "timeline.json"
  const data = JSON.stringify(timelineWrapper.saveData(), null, 2);
  const blob = new Blob([data], {
    type: 'text/json'
  });
  const elem = window.document.createElement('a');
  elem.href = window.URL.createObjectURL(blob);
  elem.download = filename;
  document.body.appendChild(elem);
  elem.click();
  document.body.removeChild(elem);
});