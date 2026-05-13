import fido from './fido.png';
import goodthings from './goodthings.png';
import hell from './hell.png';
import tulips from './tulips.png';
import soulblues from './soulblues.png';
import nightparty from './nightparty.png';
import truck from './truck.png';
import sunflower from './sunflower.png';

export const eventImageMap = {
    'fido': fido,
    'goodthings': goodthings,
    'hell': hell,
    'tulips': tulips,
    'soulblues': soulblues,
    'nightparty': nightparty,
    'truck': truck,
};

export function getEventImage(imageKey) {
  return eventImageMap[imageKey] || sunflower; // default image if key not found
}