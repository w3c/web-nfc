export class NDEFRecord extends HTMLElement {
  static get styles() {
    return `
      * { 
        width: 100%;
        height: 100%;
        text-align: center;
        font-size: 14px;
      }
  
      .byte {
        display: inline-flex;
        flex-flow: row;
        justify-content: center;
        outline: 1px solid black;
      }

      .indices {
        outline: none;
      }

      .TNF {
        flex: 1 300%;
        background-color: #c27aa0;
      }
      
      .MB { background-color: #6fa7dc; }
      .ME { background-color: #6fa7dc; }
      .CF { background-color: #a2c5c9; }
      .SR { background-color: #93c57d; }
      .IL { background-color: #ffd966; }

      .Payload-length { background-color: #00ff01;}
      .Type-length { background-color: #00ffff}
      .Id-length { background-color: #ffd966}
      .Type { background-color: #00ffff}
      .Id { background-color: #ffd966}

      .Payload {
        background-color: #00ff01;
        display: inline-flex;
        flex-flow: column;
      }

      .hidden { display: none; }
      .large { height: 4em;}

      ::slotted(*) {
        margin: 6px;
      }

      .container {
        outline: 2px solid black;
      }

      :host {
        display: block;
        max-width: 450px;
        contain: style layout;
      }
    `;
  }
  
  constructor() {
    super();
    
    const header = this.getAttribute('header').split(',');
    const content = this.getAttribute('content').split(',');
    const short = this.getAttribute('short');
    const noindices = this.getAttribute('noindices');
    
    const toggle = (entry) => content[entry] === '_' ? 'hidden' : '';
    const label = (entry, text) => content[entry] === '*' ? text : content[entry];
    const hlabel = (entry, text) => header[entry] === '*' ? text : header[entry];
    
    this.attachShadow({mode: 'open'});
    this.shadowRoot.innerHTML = `
      <style>${NDEFRecord.styles}</style>
      <div class="byte indices ${noindices === null ? '' : 'hidden'}">
        <div>7</div>
        <div>6</div>
        <div>5</div>
        <div>4</div>
        <div>3</div>
        <div>2</div>
        <div>1</div>
        <div>0</div>
      </div>
      <div class="container">
        <div class="byte">
          <div class="MB">${hlabel(0, "MB")}</div>
          <div class="ME">${hlabel(1, "ME")}</div>
          <div class="CF">${hlabel(2, "CF")}</div>
          <div class="SR">${hlabel(3, "SR")}</div>
          <div class="IL">${hlabel(4, "IL")}</div>
          <div class="TNF">${hlabel(5, "TNF")}</div>
        </div>

        <div class="byte Type-length">
          ${label(0, "TYPE LENGTH")}
        </div>
        <div class="byte Payload-length ${short !== null ? '' : 'large'}">
          ${label(1, "PAYLOAD LENGTH")}
        </div>      
        <div class="byte Id-length ${toggle(2)}">
          ${label(2, "ID LENGTH")}
        </div>
        <div class="byte Type ${toggle(3)}">
          ${label(3, "TYPE")}
        </div>
        <div class="byte Id ${toggle(4)}">
          ${label(4, "ID")}
        </div>
        <div class="byte Payload ${toggle(5)}">
          <slot name="payload">${label(5,"PAYLOAD")}</slot>
        </div>
        </div>
    `; 
  }
}

customElements.define('ndef-record', NDEFRecord);