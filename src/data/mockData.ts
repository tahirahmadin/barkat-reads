import type { CardFromAPI } from '../types';

/** Mock cards in new shape for all five categories. */
export const mockCards: CardFromAPI[] = [
    {
        id: 'hadis-1',
        category: 'Hadis',
        cardType: 'flash_card',
        title: 'Charity does not decrease wealth',
        preview: 'The Prophet (peace be upon him) said that giving in charity does not decrease one’s wealth.',
        content: '# Charity does not decrease wealth\n\n*Narrated by Abu Huraira (may Allah be pleased with him)*\n\nThe Messenger of Allah (peace and blessings be upon him) said:\n\n**"Wealth is not diminished by giving in charity."**\n\nAllah (glorified and exalted be He) replaces what we give and increases our provision when we spend in His cause. This hadith encourages Muslims to give generously without fear of loss.\n\n---\n\n*Reference: Sahih Muslim*',
        reference: 'Sahih Muslim',
        iconPlacement: 'top',
        cardColor: '#8B5A3C',
        image: 'https://cdn3d.iconscout.com/3d/premium/thumb/ramadhan-calender-3d-icon-png-download-11211796.png',
    },

];
