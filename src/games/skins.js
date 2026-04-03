/**
 * SKIN REGISTRY
 * ─────────────
 * To replace a test face with a real image:
 *   - Change type to 'image' and set the url
 * To add more skins: just push to this array.
 */
export const SKINS = [
  {
    id:         'custom',
    label:      'CHAR 1',
    type:       'image',
    color:      '#50fa7b',
    expression: null,
    url:        '/char-idle.png',
  },
  {
    id:         'vip',
    label:      'VIP',
    type:       'image',
    color:      '#f1fa8c',
    expression: null,
    // ← Replace this URL with the real face image when ready
    url:        'https://media.licdn.com/dms/image/v2/D5635AQEglGHdGQuAAg/profile-framedphoto-shrink_400_400/B56Zv9zB61IsAg-/0/1769489571820?e=1775664000&v=beta&t=B0ft-gkrxeehQYLQfrVkl9qwqnGC9pmMWnUznbUymlM',
  },
  {
    id:         'happy',
    label:      'HAPPY',
    type:       'face',
    color:      '#f1fa8c',
    expression: 'happy',
    url:        null,
  },
  {
    id:         'rage',
    label:      'RAGE',
    type:       'face',
    color:      '#ff5555',
    expression: 'rage',
    url:        null,
  },
  {
    id:         'cool',
    label:      'COOL',
    type:       'face',
    color:      '#8be9fd',
    expression: 'cool',
    url:        null,
  },
  {
    id:         'sleepy',
    label:      'SLEEPY',
    type:       'face',
    color:      '#bd93f9',
    expression: 'sleepy',
    url:        null,
  },
  {
    id:         'ghost',
    label:      'GHOST',
    type:       'face',
    color:      '#f8f8f2',
    expression: 'ghost',
    url:        null,
  },
]
