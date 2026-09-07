/**
 * Modified Gamepad class with Pink color support for DualSense
 * Based on gamepad-viewer by e7d
 */
const ORIGINAL_GAMEPAD_CODE = `
            dualsense: {
                id: /0ce6/, // 0ce6 = DualSense controller product code
                name: "DualSense",
                colors: ["white", "black"],
                triggers: true,
            },
`;

const MODIFIED_GAMEPAD_CODE = `
            dualsense: {
                id: /0ce6/, // 0ce6 = DualSense controller product code
                name: "DualSense",
                colors: ["white", "black", "pink"],
                triggers: true,
            },
`;

// Note: This file documents the modification needed.
// The actual change is to line 77 in js/gamepad.js
// Change: colors: ["white", "black"],
// To:     colors: ["white", "black", "pink"],
