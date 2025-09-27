import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'wedding-photos',
  access: (allow) => ({
    'wedding-photos/*': [
      allow.guest.to(['read', 'write', 'delete']),
    ],
  }),
});
