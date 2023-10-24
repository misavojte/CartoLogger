/**
 * Start screen element. It controls overlay <div> with a form to enter the session ID.
 */
export class StartScreenElement {
  static CSS = `
  #session-id-input {
      position: fixed;
      top: 0;
      left: 0;  
      width: 100%;
      height: 100%;
      z-index: 100000;
      background-color: rgba(0, 0, 0, 0.85);
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
  }
  #session-id-input label {
      font-size: 30px;
      color: white;
      margin-bottom: 20px;
  }
  #session-id-input label span {
      border-radius: 5px;
      padding: 5px;
      color: white;
      border: 1px solid white;
      aspect-ratio: 1 / 1;
      display: inline-flex;
      width: 45px;
      margin-left: 5px;
      align-items: center;
      justify-content: center;
  }
  #session-id-input-field {
      background-color: white;
      padding: 20px;
      border-radius: 7px;
      border: 1px solid black;
      font-size: 20px;
  }`

  static HTML = `
    <label for="session-id-input-field">Vepište ID nahrávky a stiskněte <span>q</span></label>
    <input id="session-id-input-field" type="text" placeholder="ID nahrávky" value="">
    <style>
    ${StartScreenElement.CSS}
    </style>`

  div: HTMLDivElement;
  input: HTMLInputElement;
  constructor () {
    this.div = document.createElement('div');
    this.div.id = 'session-id-input';
    this.div.innerHTML = StartScreenElement.HTML;
    this.input = this.div.querySelector('#session-id-input-field') as HTMLInputElement;
    document.body.appendChild(this.div);
  }
  setSessionId (sessionId: string) {
    this.input.value = sessionId;
  }
  getSessionId (): string {
    return this.input.value;
  }
  clear() {
    this.div.remove();
  }
}
