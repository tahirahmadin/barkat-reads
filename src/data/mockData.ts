import { SubjectItem } from '../types';

export const mockData: SubjectItem[] = [
  {
    id: 'subject_hadith',
    title: 'Hadith',
    topics: [
      {
        id: 'topic_hadith',
        title: 'Hadith',
        articles: [
          {
            id: 'hadith_kindness',
            title: 'Kindness to Parents',
            expandable: false,
            quoteType: 'quote',
            iconPlacement: 'top',
            cardColor: '#8B5A3C',
            preview:
              'The Prophet (SAW) said: "Paradise lies at the feet of mothers."',
            content: `
A man came to the Prophet (SAW) and asked, "Who among people is most deserving of my good companionship?" The Prophet (SAW) said, "Your mother." The man asked again, "Then who?" The Prophet (SAW) said, "Your mother." The man asked a third time, "Then who?" The Prophet (SAW) said, "Your mother." The man asked a fourth time, "Then who?" The Prophet (SAW) said, "Your father."

This hadith emphasizes the immense importance of honoring and being kind to parents, especially mothers. The Prophet (SAW) repeated "your mother" three times before mentioning the father, showing the special status of mothers in Islam.

Kindness to parents includes speaking gently, providing for them, visiting them regularly, and never saying even "uff" (a word of annoyance) to them. This is one of the greatest acts of worship and a direct path to Paradise.
            `,
            reference: 'Sahih Bukhari 5971',
            image: 'https://cdn3d.iconscout.com/3d/premium/thumb/ramadhan-calender-3d-icon-png-download-11211796.png',
          },
          {
            id: 'hadith_charity',
            title: 'Charity in Secret',
            expandable: false,
            quoteType: 'quote',
            iconPlacement: 'bottom',
            cardColor: '#6B8E5A',
            preview:
              'The Prophet (SAW) said: "The best charity is that given in secret."',
            content: `
The Prophet (SAW) said: "Seven people will be shaded by Allah on the Day when there will be no shade except His: a just ruler, a youth who grew up in the worship of Allah, a man whose heart is attached to mosques, two persons who love each other only for Allah's sake and they meet and part in Allah's cause only, a man who gives charity so secretly that his left hand does not know what his right hand has given, a person who remembers Allah in seclusion and his eyes are then flooded with tears, and a man who is called by a beautiful woman of high position but says: 'I fear Allah.'"

This hadith teaches us that the purest acts of worship are those done sincerely for Allah alone, without seeking recognition or praise from others. Secret charity ensures our intention remains pure and our reward is multiplied.
            `,
            reference: 'Sahih Bukhari 1423',
            image: 'https://cdn3d.iconscout.com/3d/premium/thumb/ramadhan-calender-3d-icon-png-download-11211796.png',
          },
          {
            id: 'hadith_patience',
            title: 'Patience in Adversity',
            expandable: false,
            quoteType: 'quote',
            iconPlacement: 'top',
            cardColor: '#9B7A5F',
            preview:
              'The Prophet (SAW) said: "How wonderful is the affair of the believer! Everything is good for him."',
            content: `
The Prophet (SAW) said: "How wonderful is the affair of the believer! Everything is good for him, and this applies only to the believer. If something good happens to him, he is grateful, and that is good for him. If something bad happens to him, he is patient, and that is good for him."

This hadith teaches us that a true believer sees every situation as an opportunity. Good times are a blessing to be grateful for, and difficult times are a test to be patient through. Both gratitude and patience are forms of worship that bring us closer to Allah.

When we understand that everything comes from Allah and serves a purpose, we can find peace even in hardship. Our trials become a means of purification and elevation in the sight of Allah.
            `,
            reference: 'Sahih Muslim 2999',
            image: 'https://cdn3d.iconscout.com/3d/premium/thumb/ramadhan-calender-3d-icon-png-download-11211796.png',
          },
          {
            id: 'hadith_knowledge',
            title: 'Seeking Knowledge',
            expandable: false,
            quoteType: 'quote',
            iconPlacement: 'bottom',
            cardColor: '#7A6B8E',
            preview:
              'The Prophet (SAW) said: "Seeking knowledge is an obligation upon every Muslim."',
            content: `
The Prophet (SAW) said: "Seeking knowledge is an obligation upon every Muslim." This includes both religious knowledge and beneficial worldly knowledge.

Knowledge in Islam is not limited to religious texts. Any knowledge that benefits humanity and does not contradict Islamic principles is encouraged. Medicine, science, technology, agriculture — all can be forms of worship when pursued with the right intention.

The Prophet (SAW) also said: "Whoever follows a path in pursuit of knowledge, Allah will make easy for him a path to Paradise." This shows that the journey of learning itself is rewarded, not just the destination.

We should seek knowledge throughout our lives, from the cradle to the grave. Knowledge empowers us to worship Allah better, serve others, and contribute positively to society.
            `,
            reference: 'Sunan Ibn Majah 224',
            image: 'https://cdn3d.iconscout.com/3d/premium/thumb/ramadhan-calender-3d-icon-png-download-11211796.png',
          },
          {
            id: 'hadith_smile',
            title: 'A Smile is Charity',
            expandable: false,
            quoteType: 'quote',
            iconPlacement: 'top',
            cardColor: '#A68B5A',
            preview:
              'The Prophet (SAW) said: "Smiling in the face of your brother is charity."',
            content: `
The Prophet (SAW) said: "Every good deed is charity. Indeed among good deeds is meeting your brother with a cheerful face and pouring water from your bucket into your brother's vessel."

This beautiful hadith shows us that acts of worship are not limited to formal prayers and rituals. Simple acts of kindness — a smile, helping someone, being cheerful — are all forms of charity and worship.

A smile costs nothing but can brighten someone's day, ease their burden, and create bonds of brotherhood. The Prophet (SAW) was known for his beautiful smile and gentle demeanor. He taught us that our character and how we treat others is a fundamental part of our faith.

Every interaction is an opportunity to earn reward. When we make others happy, we please Allah. When we ease someone's difficulty, we are rewarded. Islam makes worship accessible and meaningful in every moment of our lives.
            `,
            reference: 'Sunan Tirmidhi 1970',
            image: 'https://cdn3d.iconscout.com/3d/premium/thumb/ramadhan-calender-3d-icon-png-download-11211796.png',
          },
        ],
      },
    ],
  },
  {
    id: 'subject_islamic_stories',
    title: 'Islamic Stories',
    topics: [
      {
        id: 'topic_stories',
        title: 'Stories',
        articles: [
          {
            id: 'story_prophet_ibrahim',
            title: 'The Story of Prophet Ibrahim (AS)',
            expandable: true,
            preview:
              'The journey of Ibrahim (AS) teaches us about unwavering faith, sacrifice, and complete trust in Allah.',
            content: `
Prophet Ibrahim (AS) is known as Khalilullah — the friend of Allah. His story is one of profound faith tested through unimaginable trials.

When Ibrahim (AS) was young, he questioned the idols his people worshipped. With wisdom and courage, he broke them, leaving only the largest one intact. When questioned, he pointed to the large idol, saying it must have done it. The people realized idols cannot act — they are powerless.

Allah tested Ibrahim (AS) with the command to sacrifice his beloved son Ismail (AS). Both father and son submitted completely, saying "Insha'Allah, you will find me patient." At the moment of sacrifice, Allah replaced Ismail with a ram, rewarding their absolute trust.

Ibrahim (AS) also built the Kaaba with Ismail, establishing the foundation of Hajj. His legacy teaches us that true faith means complete submission to Allah's will, even when it seems impossible.
            `,
            reference: 'Quran 37:83-113',
            image: 'https://cdn3d.iconscout.com/3d/premium/thumb/ramadhan-calender-3d-icon-png-download-11211796.png',
          },
          {
            id: 'story_prophet_yusuf',
            title: 'The Story of Prophet Yusuf (AS)',
            expandable: true,
            preview:
              'A tale of patience, forgiveness, and how Allah turns trials into triumph for those who trust in Him.',
            content: `
The story of Yusuf (AS) is one of the most beautiful narratives in the Quran — a story of dreams, betrayal, patience, and ultimate victory.

Yusuf (AS) was the beloved son of Prophet Yaqub (AS). His brothers, consumed by jealousy, threw him into a well and told their father a wolf had eaten him. But Allah had a greater plan.

Yusuf (AS) was rescued, sold into slavery in Egypt, and eventually rose to become the trusted advisor of the king. Through his wisdom, he interpreted dreams and saved Egypt from famine.

When his brothers came seeking help during the famine, Yusuf (AS) recognized them but they did not recognize him. Instead of revenge, he showed mercy and forgiveness, saying: "No blame will there be upon you today. Allah will forgive you, and He is the most merciful of the merciful."

His story teaches us that patience in hardship leads to reward, and forgiveness is greater than revenge.
            `,
            reference: 'Quran 12:1-111',
            image: 'https://cdn3d.iconscout.com/3d/premium/thumb/ramadhan-calender-3d-icon-png-download-11211796.png',
          },
          {
            id: 'story_prophet_musa',
            title: 'The Story of Prophet Musa (AS)',
            expandable: true,
            preview:
              'From a basket in the river to freeing his people from oppression — Musa (AS) shows us the power of standing for justice.',
            content: `
Prophet Musa (AS) was born during a time when Pharaoh ordered all newborn boys to be killed. His mother placed him in a basket and set it on the river, trusting Allah completely. Allah guided the basket to Pharaoh's palace, where Musa (AS) was raised.

As an adult, Musa (AS) accidentally killed an Egyptian and fled to Madyan. There, he helped two women water their flock and married one of them. Allah then called him to return to Egypt and free the Children of Israel.

Musa (AS) confronted Pharaoh with miracles — his staff becoming a snake, his hand glowing white. But Pharaoh's heart remained hardened. Allah sent plagues, and finally, Musa (AS) led his people across the Red Sea, which parted miraculously.

When Pharaoh's army followed, the sea closed over them. Musa (AS) then received the Torah on Mount Sinai, establishing divine guidance for his people.

His story teaches us that Allah supports those who stand for truth and justice, no matter how powerful the oppressor seems.
            `,
            reference: 'Quran 20:9-98, 28:1-43',
            image: 'https://cdn3d.iconscout.com/3d/premium/thumb/ramadhan-calender-3d-icon-png-download-11211796.png',
          },
          {
            id: 'story_prophet_muhammad',
            title: 'The Early Life of Prophet Muhammad (SAW)',
            expandable: true,
            preview:
              'From an orphan in Makkah to the final Messenger of Allah — the beginning of a journey that changed the world.',
            content: `
Prophet Muhammad (SAW) was born in Makkah in 570 CE, during the Year of the Elephant. His father Abdullah passed away before his birth, and his mother Amina died when he was six, leaving him an orphan.

His grandfather Abdul Muttalib cared for him briefly, then his uncle Abu Talib raised him with love and protection. Even as a child, Muhammad (SAW) was known for his honesty and trustworthiness — earning the title Al-Amin, the trustworthy one.

At age 25, he married Khadijah (RA), a successful businesswoman 15 years his senior. Their marriage was one of deep love, respect, and partnership. She was the first to believe in his message when revelation began.

At 40, while meditating in the cave of Hira, the Angel Jibril (AS) appeared and commanded: "Read!" Muhammad (SAW) replied he could not read. Jibril (AS) repeated the command three times, then revealed the first verses of the Quran.

This moment marked the beginning of prophethood — a 23-year journey of receiving revelation, facing persecution, and establishing Islam. Through patience, wisdom, and divine guidance, he transformed Arabia and left a legacy for all humanity.
            `,
            reference: 'Sirah of Prophet Muhammad (SAW)',
            image: 'https://cdn3d.iconscout.com/3d/premium/thumb/ramadhan-calender-3d-icon-png-download-11211796.png',
          },
          {
            id: 'story_hijrah',
            title: 'The Hijrah: Migration to Madinah',
            expandable: true,
            preview:
              'The migration that marked the beginning of the Islamic calendar and established the first Muslim community.',
            content: `
After 13 years of persecution in Makkah, Allah commanded Prophet Muhammad (SAW) and the Muslims to migrate to Madinah. This event, the Hijrah, marks the beginning of the Islamic calendar.

The Quraysh plotted to kill the Prophet (SAW), but Allah protected him. He and Abu Bakr (RA) hid in a cave for three days while the search party passed by. A spider had spun a web across the cave entrance, and a bird had laid eggs nearby — signs that convinced the pursuers no one was inside.

The people of Madinah welcomed the Muslims with open arms. The Ansar (helpers) shared their homes and wealth with the Muhajireen (migrants). This brotherhood became a model of unity and sacrifice.

In Madinah, the Prophet (SAW) established the first Islamic state, built the first mosque, and created the Constitution of Madinah — a document that guaranteed rights for all citizens regardless of faith.

The Hijrah teaches us that sometimes leaving everything behind for the sake of Allah leads to greater blessings. It shows the power of community, sacrifice, and trusting in Allah's plan.
            `,
            reference: 'Sirah of Prophet Muhammad (SAW)',
            image: 'https://cdn3d.iconscout.com/3d/premium/thumb/ramadhan-calender-3d-icon-png-download-11211796.png',
          },
        ],
      },
    ],
  },

];
