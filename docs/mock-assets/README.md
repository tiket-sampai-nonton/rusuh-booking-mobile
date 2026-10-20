# Mock design assets

The visual reference is the seven HTML pages supplied in the sibling `V1` folder. Only `payment.html` is retained as rendered HTML; all other pages are recreated in shared Compose. The payment copy is adapted to pass the selected order and send navigation actions to Compose.

Photos are bundled from the Unsplash URLs used by those references:

| Resource | Unsplash photo ID |
|---|---|
| pesta.jpg | 1470229722913-7c0e2dbbafd3 |
| jazz.jpg | 1511192336575-5a79af67a629 |
| jazz_hero.jpg | 1501386761578-eac5c94b800a |
| rock.jpg | 1540039155733-5bb30b53aa14 |
| indie.jpg | 1493225457124-a3eb161ffa5f |
| symphony.jpg | 1516450360452-9312f5e86fc7 |
| dangdut.jpg | 1429962714451-bb934ecdc4ec |

Source pattern: `https://images.unsplash.com/photo-{photo ID}`. Images were requested at 1600 pixels and quality 85.

Plus Jakarta Sans is bundled from Google Fonts. Compose uses explicit regular, medium, semibold, bold, and extra-bold TTF weights; payment embeds the variable font. The font license is preserved in `Plus-Jakarta-Sans-OFL.txt`.
