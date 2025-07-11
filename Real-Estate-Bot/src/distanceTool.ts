import { type Tool } from 'ai';
import axios from 'axios';
import { z } from 'zod';

export const distanceTool: Tool = {
  description: 'Get driving distance and time between two locations using Google Maps.',
  parameters: z.object({
    origin: z.string().describe('Starting point in lat,lng or address format'),
    destination: z.string().describe('Ending point in lat,lng or address format')
  }),

  async execute({ origin, destination }) {
    const url = `http://localhost:3000/api/distance?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;

    console.log("Calling:", url);

    try {
      const res = await axios.get(url);
      const data = res.data;

      if (!data?.rows?.length || !data.rows[0].elements?.length) {
        return 'Could not fetch distance information.';
      }

      const element = data.rows[0].elements[0];

      if (element.status !== 'OK') {
        return `Error from API: ${element.status}`;
      }

      return `The distance from ${origin} to ${destination} is ${element.distance.text}, and it takes approximately ${element.duration.text} by road.`;
    } catch (err) {
      return `Failed to get distance: ${err}`;
    }
  },
};
