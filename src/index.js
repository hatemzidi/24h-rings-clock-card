import { RingsClockCard } from "./card";
import { RingsClockCardEditor } from "./editor";
import * as Constants from './const';

// Define the custom element for Home Assistant
customElements.define('rings-clock-card', RingsClockCard);
customElements.define("rings-clock-card-editor", RingsClockCardEditor);

// Register the card with the Home Assistant custom card registry
window.customCards = window.customCards || [];
window.customCards.push({
    type: 'rings-clock-card',
    name: '24-Hours Rings Clock Card',
    description: Constants.CARD_DESCRIPTION
});

// Log card version to console for debugging/information
console.info('🕘 %c24H-RINGS-CLOCK-CARD %c' + Constants.CARD_VERSION,
    'color: orange; font-weight: bold; background: black',
    'color: white; font-weight: bold; background: dimgray',);
