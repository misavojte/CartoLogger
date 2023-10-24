import { MonitorElement } from "../MonitorElement";

export abstract class MonitorElementPointer extends MonitorElement {
  getPointerCoordinates(event: PointerEvent): { screenX: string, screenY: string, clientX: string, clientY: string } {
    return {
      screenX: event.screenX.toString(),
      screenY: event.screenY.toString(),
      clientX: event.clientX.toString(),
      clientY: event.clientY.toString(),
    };
  }
  getPathFrom(element): string {
    let path = "";
    let current = element;
    while (current) {
      const tagName = current.tagName.toLowerCase();
      const id = current.id ? "#" + current.id : "";
      const classes = current.getAttribute("class") ? "." + current.getAttribute("class").replace(/ /g, ".") : "";
      const attributes = current.getAttributeNames().filter((name) => !["id", "class"].includes(name)).map((name) => `[${name}="${current.getAttribute(name)}"]`).join("");
      path = tagName + id + classes + attributes + " > " + path;
      current = current.parentElement;
    }
    return path;
  };

}
