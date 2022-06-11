import { convertToHsl } from 'daisyui/src/colors/functions.js'

// bootstraps the daisy ui conversion from color def to vars...
const x = convertToHsl();
// output looks like { --nc: '12 3% 5%' }, probably