import { RingsClockCard } from "./card";

// Define the custom element for Home Assistant
customElements.define('rings-clock-card', RingsClockCard);

// Register the card with the Home Assistant custom card registry
window.customCards = window.customCards || [];
window.customCards.push({
    type: 'rings-clock-card',
    name: '24-Hours Rings Clock Card',
    description: RingsClockCard.CARD_DESCRIPTION
});

// Log card version to console for debugging/information
console.info('🕘 %c24H-RINGS-CLOCK-CARD %c' + RingsClockCard.CARD_VERSION,
    'color: orange; font-weight: bold; background: black',
    'color: white; font-weight: bold; background: dimgray',);
