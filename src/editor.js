import {css, html, LitElement} from 'lit';


export class RingsClockCardEditor extends LitElement {
    static get properties() {
        return {
            _hass: {},
            _config: {state: true},
        };
    }

    setConfig(config) {
        this._config = config;
    }

    static styles = css`
        .table {
            display: table;
        }

        .row {
            display: table-row;
        }

        .cell {
            display: table-cell;
            padding: 0.5em;
        }
    `;

    render() {

         return html`
             <div class="table">
                 <div class="row">
                     <b>Feature under development.</b> For the time being, please configure using the YAML Editor.
                 </div>
             </div>
         `;
    }

}