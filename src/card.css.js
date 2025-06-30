import { css } from 'lit';

export default css`
    ha-card {
        padding: 0 16px;
        height: 100%;
        display: grid;
        place-items: center;
    }

    .hidden {
        display: none !important;
    }

    svg {
        width: 100%;
        height: 100%;
        pointer-events: none;
        display: block;
        position: absolute;
        inset: 0;
        overflow: visible;
    }

    .card-header {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 10px;
        color: inherit;
        font-size: 1.2em;
        font-weight: var(--mcg-title-font-weight, 500);
    }

    .card-title-text {
        flex-grow: 1;
        text-align: left;
        padding-right: 10px;
    }

    .card-header-icon ha-icon {
        --mdc-icon-size: 24px;
        color: var(--primary-text-color, #333);
    }

    .clock-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        padding: 10px 0; 
        margin-top: 0;
        margin-bottom: 0;
        
    }

    .clock {
        width: 100%;
        max-width: 380px; /*  Cap the max size of the clock */
        aspect-ratio: 1 / 1;
        border-radius: 50%;
        background: var(--card-background-color, #fff);
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        margin: 0 auto;
        flex-shrink: 0;
        container-type: size;
        container-name: clock-size;
    }

    .hour_marker {
        position: absolute;
        width: 0.5%;
        height: 3%;
        background: var(--secondary-text-color, #666);
        left: 50%;
        top: 3%;
        transform-origin: 50% 1560%;
        transform: translateX(-50%);
    }

    .hour_marker.major {
        width: 1%; /* Thicker major markers */
        // height: 4.5%; /* Taller major markers */
    }

    .hour_number {
        position: absolute;
        font-size: 0.8em;
        font-weight: 500;
        color: var(--primary-text-color, #333);
        width: 6%;
        height: 6%;
        display: flex;
        justify-content: center;
        align-items: center;
        left: 50%;
        top: 8%;
        transform-origin: 50% 700%;
        transform: translateX(-50%);
        user-select: none;
    }

    .hour_number span {
        display: block;
        width: 100%;
        text-align: center;
    }


    /* --- Legends Styling (no changes needed for this section regarding your request) --- */

    .legends-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 15px;
        margin-top: 20px;
        width: 100%;
        padding-bottom: 10px;
        box-sizing: border-box;
    }

    .legend_item {
        display: flex;
        align-items: center;
        font-size: 14px;
        color: var(--primary-text-color, #333);
        white-space: nowrap;
    }

    .legend_color_box {
        width: 18px;
        height: 18px;
        border-radius: 4px;
        margin-right: 8px;
        border: 1px solid var(--divider-color, #e0e0e0);
        flex-shrink: 0;
    }

    .legend_icon {
        margin-right: 8px;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .legend_icon ha-icon {
        --mdc-icon-size: 18px;
        color: inherit;
    }

    @container clock-size (max-width: 200px) {
        .hour_number {
            display: none;
        }
    }

    @media (max-width: 600px) {
        .legend_item {
            font-size: 12px;
        }

        .legend_color_box {
            width: 15px;
            height: 15px;
        }

        .legend_icon {
            font-size: 14px;
        }

        .legend_icon ha-icon {
            --mdc-icon-size: 15px;
        }
    }


`;