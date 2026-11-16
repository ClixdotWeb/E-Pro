// GENERATED FILE - do not edit by hand.
// Source: Shopify public storefront JSON (jaka1n-rd.myshopify.com)
// Regenerate: node scripts/import-shopify.mjs <raw-dir>
//
// Imported 17 of 26 products.
// Skipped 9 (see import report).

export type ImportedVariant = {
  shopifyId: number;
  title: string;
  priceInPaise: number;
  available: boolean;
  sku: string | null;
};

export type ImportedProduct = {
  slug: string;
  shopifyId: number;
  title: string;
  category: string;
  finish: string | null;
  description: string;
  images: string[];
  models: string[];
  minPriceInPaise: number;
  maxPriceInPaise: number;
  variants: ImportedVariant[];
  /** true when Shopify has no photo yet - render the swatch fallback */
  missingImages: boolean;
  /** true when no collection told us the finish - needs a human */
  needsFinish: boolean;
};

export const IMPORTED_PRODUCTS: ImportedProduct[] = [
  {
    "slug": "cam-skin",
    "shopifyId": 10841649676582,
    "title": "cam skin",
    "category": "camera",
    "finish": null,
    "description": "",
    "images": [
      "https://cdn.shopify.com/s/files/1/1019/3233/5398/files/Screenshot_2026-09-07-18-49-54-93_1c337646f29875672b5a61192b9010f9.jpg?v=1793859261"
    ],
    "models": [],
    "minPriceInPaise": 84900,
    "maxPriceInPaise": 129900,
    "variants": [
      {
        "shopifyId": 54305827782950,
        "title": "Sony",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54305827815718,
        "title": "Canon",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54305827848486,
        "title": "Nikon",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54305827881254,
        "title": "Panasonic",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54305827914022,
        "title": "FUJIFILM",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54305827946790,
        "title": "Canon price change",
        "priceInPaise": 129900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54305827979558,
        "title": "Fujifilm price change",
        "priceInPaise": 129900,
        "available": true,
        "sku": null
      }
    ],
    "missingImages": false,
    "needsFinish": true
  },
  {
    "slug": "canon-lens-skin",
    "shopifyId": 10831931474214,
    "title": "Canon Lens Skin",
    "category": "lens",
    "finish": "texture",
    "description": "Premium vinyl skin for Canon camera lenses. Precision cut with perfect fit and texture.",
    "images": [],
    "models": [
      "test",
      "Canon EF 100mm f/2.8L IS USM Macro",
      "Canon EF 16-35mm f/2.8L II USM",
      "Canon EF 16-35mm f/2.8L III USM",
      "Canon EF 16-35mm f/2.8L USM",
      "Canon EF 16-35mm f/4L IS USM",
      "Canon EF 17-35mm f/2.8L USM",
      "Canon EF 24-105mm f/4L IS II USM",
      "Canon EF 135mm f/2L USM",
      "Canon EF-M 18-150mm F3.5-6.3 IS STM",
      "Canon EF-M 55-200mm F4.5-6.3 IS STM",
      "Canon EF-S 17-55mm f/2.8 IS USM",
      "Canon EF-S 18-135mm f/3.5-5.6 IS USM",
      "Canon RF 15-35mm F/2.8L IS USM",
      "Canon RF 24-70mm f/2.8L IS USM",
      "Canon RF 24-105mm f/4-7.1 IS STM",
      "Canon RF 24-105mm f/4L IS USM",
      "Canon RF 24-240mm f/4-6.3 IS USM",
      "Canon RF 35mm f/1.8 Macro IS STM",
      "Canon RF 50mm f/1.2L USM",
      "Canon RF 50mm f/1.8 STM",
      "Canon RF 70-200mm f/2.8 L IS USM",
      "Canon RF 85mm f/1.2L USM",
      "Canon RF 85mm f/2 Macro IS STM",
      "Canon RF 16mm f/2.8 STM",
      "Canon RF 35mm f/1.4 L VCM"
    ],
    "minPriceInPaise": 7900,
    "maxPriceInPaise": 159900,
    "variants": [
      {
        "shopifyId": 54412356518182,
        "title": "test",
        "priceInPaise": 7900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254343651622,
        "title": "Canon EF 100mm f/2.8L IS USM Macro",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254343684390,
        "title": "Canon EF 16-35mm f/2.8L II USM",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254343717158,
        "title": "Canon EF 16-35mm f/2.8L III USM",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254343749926,
        "title": "Canon EF 16-35mm f/2.8L USM",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254343782694,
        "title": "Canon EF 16-35mm f/4L IS USM",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254343815462,
        "title": "Canon EF 17-35mm f/2.8L USM",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254343848230,
        "title": "Canon EF 24-105mm f/4L IS II USM",
        "priceInPaise": 85900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254343880998,
        "title": "Canon EF 135mm f/2L USM",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254343913766,
        "title": "Canon EF-M 18-150mm F3.5-6.3 IS STM",
        "priceInPaise": 69900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254343946534,
        "title": "Canon EF-M 55-200mm F4.5-6.3 IS STM",
        "priceInPaise": 69900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254343979302,
        "title": "Canon EF-S 17-55mm f/2.8 IS USM",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254344012070,
        "title": "Canon EF-S 18-135mm f/3.5-5.6 IS USM",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254344044838,
        "title": "Canon RF 15-35mm F/2.8L IS USM",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254344077606,
        "title": "Canon RF 24-70mm f/2.8L IS USM",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254344110374,
        "title": "Canon RF 24-105mm f/4-7.1 IS STM",
        "priceInPaise": 69900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254344143142,
        "title": "Canon RF 24-105mm f/4L IS USM",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254344175910,
        "title": "Canon RF 24-240mm f/4-6.3 IS USM",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254344208678,
        "title": "Canon RF 35mm f/1.8 Macro IS STM",
        "priceInPaise": 39900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254344241446,
        "title": "Canon RF 50mm f/1.2L USM",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254344274214,
        "title": "Canon RF 50mm f/1.8 STM",
        "priceInPaise": 39900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254344306982,
        "title": "Canon RF 70-200mm f/2.8 L IS USM",
        "priceInPaise": 159900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254344339750,
        "title": "Canon RF 85mm f/1.2L USM",
        "priceInPaise": 109900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254344372518,
        "title": "Canon RF 85mm f/2 Macro IS STM",
        "priceInPaise": 69900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254344405286,
        "title": "Canon RF 16mm f/2.8 STM",
        "priceInPaise": 39900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254344438054,
        "title": "Canon RF 35mm f/1.4 L VCM",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      }
    ],
    "missingImages": true,
    "needsFinish": false
  },
  {
    "slug": "fujifilm-lens-skin",
    "shopifyId": 10831925805350,
    "title": "Fujifilm Lens Skin",
    "category": "lens",
    "finish": "texture",
    "description": "Premium vinyl skin for Fujifilm camera lenses. Precision cut with perfect fit and texture.",
    "images": [],
    "models": [
      "Fujifilm GF 120mm F4 R LM OIS WR Macro",
      "Fujifilm GF 23mm F4 R LM WR",
      "Fujifilm GF 32-64mm F4 R LM WR",
      "Fujifilm GF 110mm F2 R LM WR",
      "Fujifilm XF 10-24mm F4 R OIS WR",
      "Fujifilm XF 16mm F1.4 R WR",
      "Fujifilm XF 18-55mm f2.8 F4.0 R LM",
      "Fujifilm XF 50-140mm F2.8 R LM OIS WR",
      "Fujifilm XF 50mm F1.0 R WR",
      "Fujifilm XF 56mm F1.2 R WR",
      "Fujifilm XF 90mm F2 R LM WR",
      "Fujifilm XF 16-55mm F2.8 R LM WR",
      "Fujifilm XF 16-80mm F4 R OIS WR"
    ],
    "minPriceInPaise": 69900,
    "maxPriceInPaise": 159900,
    "variants": [
      {
        "shopifyId": 54254308884774,
        "title": "Fujifilm GF 120mm F4 R LM OIS WR Macro",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254308917542,
        "title": "Fujifilm GF 23mm F4 R LM WR",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254308950310,
        "title": "Fujifilm GF 32-64mm F4 R LM WR",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254308983078,
        "title": "Fujifilm GF 110mm F2 R LM WR",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254309015846,
        "title": "Fujifilm XF 10-24mm F4 R OIS WR",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254309048614,
        "title": "Fujifilm XF 16mm F1.4 R WR",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254309081382,
        "title": "Fujifilm XF 18-55mm f2.8 F4.0 R LM",
        "priceInPaise": 69900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254309114150,
        "title": "Fujifilm XF 50-140mm F2.8 R LM OIS WR",
        "priceInPaise": 159900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254309146918,
        "title": "Fujifilm XF 50mm F1.0 R WR",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254309179686,
        "title": "Fujifilm XF 56mm F1.2 R WR",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254309212454,
        "title": "Fujifilm XF 90mm F2 R LM WR",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254309245222,
        "title": "Fujifilm XF 16-55mm F2.8 R LM WR",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254309277990,
        "title": "Fujifilm XF 16-80mm F4 R OIS WR",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      }
    ],
    "missingImages": true,
    "needsFinish": false
  },
  {
    "slug": "nikon-lens-skin",
    "shopifyId": 10831924560166,
    "title": "Nikon Lens Skin",
    "category": "lens",
    "finish": "texture",
    "description": "Premium vinyl skin for Nikon camera lenses. Precision cut with perfect fit and texture.",
    "images": [],
    "models": [
      "NIKKOR Z 24-70mm f/2.8 S",
      "AF-S NIKKOR 24-70mm f/2.8 E ED VR",
      "AF-S NIKKOR 24-85mm f/3.5-4.5G ED VR",
      "AF-S NIKKOR 28mm f/1.4E ED",
      "NIKKOR Z 35 mm f/1.8 S",
      "NIKKOR Z 50mm f/1.8 S",
      "Nikon AF-S 70-200mm F2.8 G ED VR II",
      "AF Zoom-NIKKOR 80-200mm f/2.8D ED",
      "AF-S NIKKOR 80-400mm f/4.5-5.6G ED VR",
      "AF-S NIKKOR 85mm f/1.8G",
      "NIKKOR Z 85mm f/1.8 S",
      "AF-S NIKKOR 200-400mm F4G ED VR II",
      "AF-S NIKKOR DX 18-200mm f/3.5-5.6G ED VR II",
      "AF-S NIKKOR 16-35 mm f/4G ED VR",
      "AF-S NIKKOR DX 18-140mm f/3.5-5.6G VR",
      "NIKKOR Z 14-24mm f/2.8 S",
      "NIKKOR Z 14-30 mm f/4 S",
      "NIKKOR Z 20mm f/1.8 S",
      "NIKKOR Z 24-70mm f/4 S",
      "NIKKOR Z 50 mm f/1.2 S",
      "NIKKOR Z 70-200mm f/2.8 VR S",
      "NIKKOR Z 24-120mm f/4 S",
      "NIKKOR Z 28-75mm f/2.8",
      "NIKKOR Z 35mm f/1.4",
      "NIKKOR Z DX 18-140mm f/3.5-6.3 VR"
    ],
    "minPriceInPaise": 800,
    "maxPriceInPaise": 159900,
    "variants": [
      {
        "shopifyId": 54254301577510,
        "title": "NIKKOR Z 24-70mm f/2.8 S",
        "priceInPaise": 800,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254301610278,
        "title": "AF-S NIKKOR 24-70mm f/2.8 E ED VR",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254301643046,
        "title": "AF-S NIKKOR 24-85mm f/3.5-4.5G ED VR",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254301675814,
        "title": "AF-S NIKKOR 28mm f/1.4E ED",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254301708582,
        "title": "NIKKOR Z 35 mm f/1.8 S",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254301741350,
        "title": "NIKKOR Z 50mm f/1.8 S",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254301774118,
        "title": "Nikon AF-S 70-200mm F2.8 G ED VR II",
        "priceInPaise": 109900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254301806886,
        "title": "AF Zoom-NIKKOR 80-200mm f/2.8D ED",
        "priceInPaise": 109900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254301839654,
        "title": "AF-S NIKKOR 80-400mm f/4.5-5.6G ED VR",
        "priceInPaise": 109900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254301872422,
        "title": "AF-S NIKKOR 85mm f/1.8G",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254301905190,
        "title": "NIKKOR Z 85mm f/1.8 S",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254301937958,
        "title": "AF-S NIKKOR 200-400mm F4G ED VR II",
        "priceInPaise": 159900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254301970726,
        "title": "AF-S NIKKOR DX 18-200mm f/3.5-5.6G ED VR II",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254302003494,
        "title": "AF-S NIKKOR 16-35 mm f/4G ED VR",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254302036262,
        "title": "AF-S NIKKOR DX 18-140mm f/3.5-5.6G VR",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254302069030,
        "title": "NIKKOR Z 14-24mm f/2.8 S",
        "priceInPaise": 109900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254302101798,
        "title": "NIKKOR Z 14-30 mm f/4 S",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254302134566,
        "title": "NIKKOR Z 20mm f/1.8 S",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254302167334,
        "title": "NIKKOR Z 24-70mm f/4 S",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254302200102,
        "title": "NIKKOR Z 50 mm f/1.2 S",
        "priceInPaise": 109900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254302232870,
        "title": "NIKKOR Z 70-200mm f/2.8 VR S",
        "priceInPaise": 159900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254302265638,
        "title": "NIKKOR Z 24-120mm f/4 S",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254302298406,
        "title": "NIKKOR Z 28-75mm f/2.8",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254302331174,
        "title": "NIKKOR Z 35mm f/1.4",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254302363942,
        "title": "NIKKOR Z DX 18-140mm f/3.5-6.3 VR",
        "priceInPaise": 69900,
        "available": true,
        "sku": null
      }
    ],
    "missingImages": true,
    "needsFinish": false
  },
  {
    "slug": "panasonic-lens-skin",
    "shopifyId": 10831920300326,
    "title": "Panasonic Lens Skin",
    "category": "lens",
    "finish": "texture",
    "description": "Premium vinyl skin for Panasonic camera lenses. Precision cut with perfect fit and texture.",
    "images": [],
    "models": [
      "Panasonic LUMIX S 50mm F1.8 L-Mount Lens",
      "Panasonic LUMIX S 35mm F1.8 L-Mount Lens",
      "Panasonic LEICA DG VARIO-ELMARIT 12-60MM F2.8-4.0 ASPH"
    ],
    "minPriceInPaise": 84900,
    "maxPriceInPaise": 84900,
    "variants": [
      {
        "shopifyId": 54254278541606,
        "title": "Panasonic LUMIX S 50mm F1.8 L-Mount Lens",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254278574374,
        "title": "Panasonic LUMIX S 35mm F1.8 L-Mount Lens",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254278607142,
        "title": "Panasonic LEICA DG VARIO-ELMARIT 12-60MM F2.8-4.0 ASPH",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      }
    ],
    "missingImages": true,
    "needsFinish": false
  },
  {
    "slug": "samyang-lens-skin",
    "shopifyId": 10831918989606,
    "title": "Samyang Lens Skin",
    "category": "lens",
    "finish": "texture",
    "description": "Premium vinyl skin for Samyang camera lenses. Precision cut with perfect fit and texture.",
    "images": [],
    "models": [
      "Samyang AF 85mm F1.4 FE Sony E Lens",
      "Samyang AF 85mm F1.4 EF Canon Lens",
      "Samyang AF 85mm F1.4 Sony FE II MK2",
      "Samyang AF 24-70mm f/2.8 FE for Sony E Lens",
      "Samyang AF 35mm f/1.4 FE for Sony E Lens",
      "Samyang AF 35mm f/1.8 FE for Sony E Lens"
    ],
    "minPriceInPaise": 84900,
    "maxPriceInPaise": 84900,
    "variants": [
      {
        "shopifyId": 54254271103270,
        "title": "Samyang AF 85mm F1.4 FE Sony E Lens",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254271136038,
        "title": "Samyang AF 85mm F1.4 EF Canon Lens",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254271168806,
        "title": "Samyang AF 85mm F1.4 Sony FE II MK2",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254271201574,
        "title": "Samyang AF 24-70mm f/2.8 FE for Sony E Lens",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254271234342,
        "title": "Samyang AF 35mm f/1.4 FE for Sony E Lens",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254271267110,
        "title": "Samyang AF 35mm f/1.8 FE for Sony E Lens",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      }
    ],
    "missingImages": true,
    "needsFinish": false
  },
  {
    "slug": "sigma-lens-skin",
    "shopifyId": 10831917220134,
    "title": "Sigma Lens Skin",
    "category": "lens",
    "finish": "texture",
    "description": "Premium vinyl skin for Sigma camera lenses. Precision cut with perfect fit and texture.",
    "images": [],
    "models": [
      "Sigma 16mm f/1.4 DC DN (E Mount)",
      "Sigma 17-50mm f/2.8 EX DC OS HSM",
      "Sigma 18-35mm f/1.8 DC HSM Art Lens",
      "Sigma 24-70mm f/2.8 DG DN (E Mount)",
      "Sigma 30mm f/1.4 DC DN (E Mount)",
      "Sigma 35mm f/1.4 DG HSM Art Lens",
      "Sigma 56mm f/1.4 DC DN (E Mount)",
      "Sigma 85mm f/1.4 DG DN (E Mount)",
      "Sigma 85mm f/1.4 DG HSM",
      "Sigma 105mm f/1.4 DG HSM",
      "Sigma 35mm f/1.4 DG DN (E Mount)",
      "Sigma 24mm f/1.4 DG DN (E Mount)",
      "Sigma 16-28mm f/2.8 DG DN (E Mount)",
      "Sigma 50mm f/1.4 DG DN (E Mount)",
      "Sigma 24-70mm f/2.8 DG DN II",
      "Sigma 70-200mm f/2.8 DG DN",
      "Sigma 28-45mm f/1.8 DG DN Art (E-Mount)",
      "Sigma 18-50mm F2.8 DC DN",
      "Sigma 35mm F1.4 DG II"
    ],
    "minPriceInPaise": 69900,
    "maxPriceInPaise": 159900,
    "variants": [
      {
        "shopifyId": 54254261371174,
        "title": "Sigma 16mm f/1.4 DC DN (E Mount)",
        "priceInPaise": 69900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254261403942,
        "title": "Sigma 17-50mm f/2.8 EX DC OS HSM",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254261436710,
        "title": "Sigma 18-35mm f/1.8 DC HSM Art Lens",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254261469478,
        "title": "Sigma 24-70mm f/2.8 DG DN (E Mount)",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254261502246,
        "title": "Sigma 30mm f/1.4 DC DN (E Mount)",
        "priceInPaise": 69900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254261535014,
        "title": "Sigma 35mm f/1.4 DG HSM Art Lens",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254261567782,
        "title": "Sigma 56mm f/1.4 DC DN (E Mount)",
        "priceInPaise": 69900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254261600550,
        "title": "Sigma 85mm f/1.4 DG DN (E Mount)",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254261633318,
        "title": "Sigma 85mm f/1.4 DG HSM",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254261666086,
        "title": "Sigma 105mm f/1.4 DG HSM",
        "priceInPaise": 109900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254261698854,
        "title": "Sigma 35mm f/1.4 DG DN (E Mount)",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254261731622,
        "title": "Sigma 24mm f/1.4 DG DN (E Mount)",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254261764390,
        "title": "Sigma 16-28mm f/2.8 DG DN (E Mount)",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254261797158,
        "title": "Sigma 50mm f/1.4 DG DN (E Mount)",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254261829926,
        "title": "Sigma 24-70mm f/2.8 DG DN II",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254261862694,
        "title": "Sigma 70-200mm f/2.8 DG DN",
        "priceInPaise": 159900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254261895462,
        "title": "Sigma 28-45mm f/1.8 DG DN Art (E-Mount)",
        "priceInPaise": 109900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254261928230,
        "title": "Sigma 18-50mm F2.8 DC DN",
        "priceInPaise": 69900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254261960998,
        "title": "Sigma 35mm F1.4 DG II",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      }
    ],
    "missingImages": true,
    "needsFinish": false
  },
  {
    "slug": "tamron-lens-skin",
    "shopifyId": 10831913713958,
    "title": "Tamron Lens Skin",
    "category": "lens",
    "finish": "texture",
    "description": "Premium vinyl skin for Tamron camera lenses. Precision cut with perfect fit and texture.",
    "images": [],
    "models": [
      "Tamron 17-28mm f/2.8 Di III RXD (Sony E-Mount)",
      "Tamron 17-35mm F/2.8-4 Di OSD (for Nikon)",
      "Tamron 17-70mm F/2.8 Di III-A VC RXD (Sony E-Mount)",
      "Tamron 24mm f/2.8 Di III OSD M1:2 (Sony E-Mount)",
      "Tamron 28-75mm f/2.8 Di III RXD (Sony E-Mount)",
      "Tamron 28-200mm F/2.8-5.6 Di III RXD (Sony E-Mount)",
      "Tamron 70-180mm f2.8 Di III VXD (Sony E-Mount)",
      "Tamron 70-300mm f/4.5-6.3 Di III RXD (Sony E-Mount)",
      "Tamron SP 85mm f/1.8 Di VC USD",
      "Tamron SP 24-70mm f/2.8 Di VC USD G2",
      "Tamron SP 35mm F/1.4 Di USD",
      "Tamron SP 45mm F1.8 Di VC USD",
      "Tamron 28-75mm f/2.8 Di III VXD G2 (Sony E-Mount)",
      "Tamron 35mm f/2.8 Di III OSD M 1:2 (Sony E-Mount)"
    ],
    "minPriceInPaise": 84900,
    "maxPriceInPaise": 84900,
    "variants": [
      {
        "shopifyId": 54254242431270,
        "title": "Tamron 17-28mm f/2.8 Di III RXD (Sony E-Mount)",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254242464038,
        "title": "Tamron 17-35mm F/2.8-4 Di OSD (for Nikon)",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254242496806,
        "title": "Tamron 17-70mm F/2.8 Di III-A VC RXD (Sony E-Mount)",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254242529574,
        "title": "Tamron 24mm f/2.8 Di III OSD M1:2 (Sony E-Mount)",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254242562342,
        "title": "Tamron 28-75mm f/2.8 Di III RXD (Sony E-Mount)",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254242595110,
        "title": "Tamron 28-200mm F/2.8-5.6 Di III RXD (Sony E-Mount)",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254242627878,
        "title": "Tamron 70-180mm f2.8 Di III VXD (Sony E-Mount)",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254242660646,
        "title": "Tamron 70-300mm f/4.5-6.3 Di III RXD (Sony E-Mount)",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254242693414,
        "title": "Tamron SP 85mm f/1.8 Di VC USD",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254242726182,
        "title": "Tamron SP 24-70mm f/2.8 Di VC USD G2",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254242758950,
        "title": "Tamron SP 35mm F/1.4 Di USD",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254242791718,
        "title": "Tamron SP 45mm F1.8 Di VC USD",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254242824486,
        "title": "Tamron 28-75mm f/2.8 Di III VXD G2 (Sony E-Mount)",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254242857254,
        "title": "Tamron 35mm f/2.8 Di III OSD M 1:2 (Sony E-Mount)",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      }
    ],
    "missingImages": true,
    "needsFinish": false
  },
  {
    "slug": "viltrox-lens-skin",
    "shopifyId": 10831912403238,
    "title": "Viltrox Lens Skin",
    "category": "lens",
    "finish": "texture",
    "description": "Premium vinyl skin for Viltrox camera lenses. Precision cut with perfect fit and texture.",
    "images": [],
    "models": [
      "Viltrox AF 85mm F1.8 II FE (For Sony)",
      "Viltrox AF 85mm f/1.8 RF (For Canon)",
      "Viltrox 85mm f/1.8 STM",
      "Viltrox AF 56mm F1.4 XF"
    ],
    "minPriceInPaise": 84900,
    "maxPriceInPaise": 84900,
    "variants": [
      {
        "shopifyId": 54254235320614,
        "title": "Viltrox AF 85mm F1.8 II FE (For Sony)",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254235353382,
        "title": "Viltrox AF 85mm f/1.8 RF (For Canon)",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254235386150,
        "title": "Viltrox 85mm f/1.8 STM",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54254235418918,
        "title": "Viltrox AF 56mm F1.4 XF",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      }
    ],
    "missingImages": true,
    "needsFinish": false
  },
  {
    "slug": "sony-lens-skin",
    "shopifyId": 10831804498214,
    "title": "Sony Lens Skin",
    "category": "lens",
    "finish": "texture",
    "description": "Premium vinyl skin for Sony camera lenses. Precision cut with perfect fit and texture.",
    "images": [],
    "models": [
      "Sony FE 24-70mm F4 Zeiss OSS Lens",
      "Sony E 10-18mm F4 OSS",
      "Sony FE 12-24mm f/4 G Ultra Wide Angle Lens",
      "Sony FE 16-35mm F2.8 GM",
      "Sony 16-35mm f/2.8 ZA SSM II Vario-Sonnar T*",
      "Sony E 16-70mm F4 ZA OSS Vario-Tessar T*",
      "Sony E PZ 18-105mm F4 G OSS",
      "Sony E 18-135mm F3.5-5.6 OSS",
      "Sony FE 24-70mm F2.8 GM",
      "Sony FE 24mm F1.4 GM",
      "Sony FE 70-300mm F4.5-5.6 G OSS",
      "Sony FE 135mm F1.8 GM",
      "Sony E 50mm F1.8 OSS",
      "Sony E 55-210mm F4.5-6.3 OSS",
      "Sony FE 20mm f/1.8 G",
      "Sony FE 24-105mm F4 G OSS",
      "Sony FE 28-70mm F3.5-5.6 OSS",
      "Sony FE 35mm f/1.8",
      "Sony FE 55mm F1.8 ZA Carl Zeiss Sonnar T*",
      "Sony FE 70-200mm F4 G OSS",
      "Sony FE 85mm F1.4 GM",
      "Sony FE 85mm F1.8",
      "Sony FE 90mm F2.8 Macro G OSS",
      "Sony FE 50mm F1.4 ZA Zeiss Planar T*",
      "Sony 135mm f1.8 ZA Sonnar T*",
      "Sony FE 35mm F1.4 ZA Zeiss Distagon T*",
      "Sony FE 100-400mm F4.5-5.6 GM OSS",
      "Sony FE 200-600mm F5.6-6.3 G OSS",
      "Sony FE 50mm F1.8",
      "Sony FE 400mm f/2.8 GM OSS",
      "Sony FE 24-70mm f/4 ZA OSS Vario-Tessar T*",
      "Sony FE 50mm f/1.2 GM",
      "Sony FE 35mm F/1.4 GM",
      "Zeiss 85mm F1.8 Batis",
      "Sony FE 24mm f/1.4 GM",
      "Sony FE 50mm f/1.4 GM",
      "Sony FE 70-200mm F2.8 GM OSS II",
      "Sony FE PZ 16-35mm F4 G",
      "Sony FE 16-35mm F2.8 GM II",
      "Sony FE 14mm f/1.8 GM",
      "Sony FE 85mm f1.4 GM II",
      "Sony FE 24-70mm f/2.8 GM II",
      "Sony FE 28-70mm F2 GM",
      "Sony FE 24-50mm F2.8 G"
    ],
    "minPriceInPaise": 69900,
    "maxPriceInPaise": 259900,
    "variants": [
      {
        "shopifyId": 54253541163302,
        "title": "Sony FE 24-70mm F4 Zeiss OSS Lens",
        "priceInPaise": 94900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54253541196070,
        "title": "Sony E 10-18mm F4 OSS",
        "priceInPaise": 69900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54253541228838,
        "title": "Sony FE 12-24mm f/4 G Ultra Wide Angle Lens",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54253541261606,
        "title": "Sony FE 16-35mm F2.8 GM",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54253541294374,
        "title": "Sony 16-35mm f/2.8 ZA SSM II Vario-Sonnar T*",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54253541327142,
        "title": "Sony E 16-70mm F4 ZA OSS Vario-Tessar T*",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54253541359910,
        "title": "Sony E PZ 18-105mm F4 G OSS",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54253541392678,
        "title": "Sony E 18-135mm F3.5-5.6 OSS",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54253541425446,
        "title": "Sony FE 24-70mm F2.8 GM",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54253541458214,
        "title": "Sony FE 24mm F1.4 GM",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54253541490982,
        "title": "Sony FE 70-300mm F4.5-5.6 G OSS",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54253541523750,
        "title": "Sony FE 135mm F1.8 GM",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54253541556518,
        "title": "Sony E 50mm F1.8 OSS",
        "priceInPaise": 69900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54253541589286,
        "title": "Sony E 55-210mm F4.5-6.3 OSS",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54253541622054,
        "title": "Sony FE 20mm f/1.8 G",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54253541654822,
        "title": "Sony FE 24-105mm F4 G OSS",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54253541687590,
        "title": "Sony FE 28-70mm F3.5-5.6 OSS",
        "priceInPaise": 69900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54253541720358,
        "title": "Sony FE 35mm f/1.8",
        "priceInPaise": 69900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54253541753126,
        "title": "Sony FE 55mm F1.8 ZA Carl Zeiss Sonnar T*",
        "priceInPaise": 69900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54253541785894,
        "title": "Sony FE 70-200mm F4 G OSS",
        "priceInPaise": 119900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54253541818662,
        "title": "Sony FE 85mm F1.4 GM",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54253541851430,
        "title": "Sony FE 85mm F1.8",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54253541884198,
        "title": "Sony FE 90mm F2.8 Macro G OSS",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54253541916966,
        "title": "Sony FE 50mm F1.4 ZA Zeiss Planar T*",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54253541949734,
        "title": "Sony 135mm f1.8 ZA Sonnar T*",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54253541982502,
        "title": "Sony FE 35mm F1.4 ZA Zeiss Distagon T*",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54253542015270,
        "title": "Sony FE 100-400mm F4.5-5.6 GM OSS",
        "priceInPaise": 159900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54253542048038,
        "title": "Sony FE 200-600mm F5.6-6.3 G OSS",
        "priceInPaise": 159900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54253542080806,
        "title": "Sony FE 50mm F1.8",
        "priceInPaise": 69900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54253542113574,
        "title": "Sony FE 400mm f/2.8 GM OSS",
        "priceInPaise": 259900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54253542146342,
        "title": "Sony FE 24-70mm f/4 ZA OSS Vario-Tessar T*",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54253542179110,
        "title": "Sony FE 50mm f/1.2 GM",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54253542211878,
        "title": "Sony FE 35mm F/1.4 GM",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54253542244646,
        "title": "Zeiss 85mm F1.8 Batis",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54253542277414,
        "title": "Sony FE 24mm f/1.4 GM",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54253542310182,
        "title": "Sony FE 50mm f/1.4 GM",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54253542342950,
        "title": "Sony FE 70-200mm F2.8 GM OSS II",
        "priceInPaise": 159900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54253542375718,
        "title": "Sony FE PZ 16-35mm F4 G",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54253542408486,
        "title": "Sony FE 16-35mm F2.8 GM II",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54253542441254,
        "title": "Sony FE 14mm f/1.8 GM",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54253542474022,
        "title": "Sony FE 85mm f1.4 GM II",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54253542506790,
        "title": "Sony FE 24-70mm f/2.8 GM II",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54253542539558,
        "title": "Sony FE 28-70mm F2 GM",
        "priceInPaise": 109900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54253542572326,
        "title": "Sony FE 24-50mm F2.8 G",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      }
    ],
    "missingImages": true,
    "needsFinish": false
  },
  {
    "slug": "forged-carbon",
    "shopifyId": 10815269273894,
    "title": "forged carbon",
    "category": "camera",
    "finish": "texture",
    "description": "",
    "images": [
      "https://cdn.shopify.com/s/files/1/1019/3233/5398/files/Screenshot_2026-09-07-18-48-01-64_1c337646f29875672b5a61192b9010f9.jpg?v=1792652693"
    ],
    "models": [],
    "minPriceInPaise": 89900,
    "maxPriceInPaise": 129900,
    "variants": [
      {
        "shopifyId": 54171873149222,
        "title": "Sony",
        "priceInPaise": 89900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54171873181990,
        "title": "Canon",
        "priceInPaise": 89900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54171873214758,
        "title": "Nikon",
        "priceInPaise": 89900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54171873247526,
        "title": "Panasonic",
        "priceInPaise": 89900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54171873280294,
        "title": "FUJIFILM",
        "priceInPaise": 89900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54171873313062,
        "title": "Canon price change",
        "priceInPaise": 129900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54171873345830,
        "title": "Fujifilm price change",
        "priceInPaise": 129900,
        "available": true,
        "sku": null
      }
    ],
    "missingImages": false,
    "needsFinish": false
  },
  {
    "slug": "sony-lens-31",
    "shopifyId": 10803387597094,
    "title": "Sony Lens 31",
    "category": "lens",
    "finish": null,
    "description": "",
    "images": [
      "https://cdn.shopify.com/s/files/1/1019/3233/5398/files/ChatGPTImageSep28_2026_07_31_06PM.png?v=1792068502"
    ],
    "models": [],
    "minPriceInPaise": 39900,
    "maxPriceInPaise": 259900,
    "variants": [
      {
        "shopifyId": 54155316789542,
        "title": "Tier 399",
        "priceInPaise": 39900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54155316822310,
        "title": "Tier 699",
        "priceInPaise": 69900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54155316855078,
        "title": "Tier 849",
        "priceInPaise": 84900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54155316887846,
        "title": "Tier 1099",
        "priceInPaise": 109900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54155316920614,
        "title": "Tier 1599",
        "priceInPaise": 159900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 54155316953382,
        "title": "Tier 2599",
        "priceInPaise": 259900,
        "available": true,
        "sku": null
      }
    ],
    "missingImages": false,
    "needsFinish": true
  },
  {
    "slug": "camera-honey",
    "shopifyId": 10757093425446,
    "title": "Camera Honey",
    "category": "camera",
    "finish": null,
    "description": "",
    "images": [],
    "models": [],
    "minPriceInPaise": 80000,
    "maxPriceInPaise": 129900,
    "variants": [
      {
        "shopifyId": 53902059536678,
        "title": "Sony",
        "priceInPaise": 80000,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 53902059569446,
        "title": "Nikon",
        "priceInPaise": 80000,
        "available": false,
        "sku": null
      },
      {
        "shopifyId": 53902059602214,
        "title": "Canon",
        "priceInPaise": 80000,
        "available": false,
        "sku": null
      },
      {
        "shopifyId": 53902059634982,
        "title": "Panasonic",
        "priceInPaise": 80000,
        "available": false,
        "sku": null
      },
      {
        "shopifyId": 53902059667750,
        "title": "FUJIFILM",
        "priceInPaise": 80000,
        "available": false,
        "sku": null
      },
      {
        "shopifyId": 53902059700518,
        "title": "Canon price change",
        "priceInPaise": 129900,
        "available": false,
        "sku": null
      },
      {
        "shopifyId": 53902059733286,
        "title": "Fujifilm price change",
        "priceInPaise": 129900,
        "available": false,
        "sku": null
      }
    ],
    "missingImages": true,
    "needsFinish": true
  },
  {
    "slug": "lap-2nd",
    "shopifyId": 10667681186086,
    "title": "Lap  2nd",
    "category": "laptop",
    "finish": null,
    "description": "",
    "images": [],
    "models": [],
    "minPriceInPaise": 10000,
    "maxPriceInPaise": 10000,
    "variants": [
      {
        "shopifyId": 53795707388198,
        "title": "hp",
        "priceInPaise": 10000,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 53795707420966,
        "title": "msi",
        "priceInPaise": 10000,
        "available": true,
        "sku": null
      }
    ],
    "missingImages": true,
    "needsFinish": true
  },
  {
    "slug": "hhh",
    "shopifyId": 10655373754662,
    "title": "lap sticker",
    "category": "laptop",
    "finish": null,
    "description": "",
    "images": [
      "https://cdn.shopify.com/s/files/1/1019/3233/5398/files/LOQ_Top_Mokups_copy.jpg?v=1785227308",
      "https://cdn.shopify.com/s/files/1/1019/3233/5398/files/LOQ_Inside_Mokups_copy.jpg?v=1785227309",
      "https://cdn.shopify.com/s/files/1/1019/3233/5398/files/LOQ_Laptop_Bottom_copy.jpg?v=1785227313"
    ],
    "models": [],
    "minPriceInPaise": 54500,
    "maxPriceInPaise": 120000,
    "variants": [
      {
        "shopifyId": 53795672817958,
        "title": "msi",
        "priceInPaise": 54500,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 53795672850726,
        "title": "hp",
        "priceInPaise": 120000,
        "available": true,
        "sku": null
      }
    ],
    "missingImages": false,
    "needsFinish": true
  },
  {
    "slug": "black-honeycomb",
    "shopifyId": 10643141067046,
    "title": "Black Honeycomb",
    "category": "camera",
    "finish": "texture",
    "description": "",
    "images": [
      "https://cdn.shopify.com/s/files/1/1019/3233/5398/files/BlackHoneycombCameraSkinFront_33a01fa3-a853-40c3-a6ff-6a249bf0a493.jpg?v=1784788122",
      "https://cdn.shopify.com/s/files/1/1019/3233/5398/files/BlackHoneycombCameraSkinBack_fd47a6d8-086f-4559-89e0-fe436885e9bc.jpg?v=1784788122"
    ],
    "models": [],
    "minPriceInPaise": 89900,
    "maxPriceInPaise": 129900,
    "variants": [
      {
        "shopifyId": 53795773350182,
        "title": "FUJIFILM",
        "priceInPaise": 89900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 53795773382950,
        "title": "Panasonic",
        "priceInPaise": 89900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 53795773415718,
        "title": "Nikon",
        "priceInPaise": 89900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 53795773448486,
        "title": "Canon",
        "priceInPaise": 89900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 53795807559974,
        "title": "Canon price change",
        "priceInPaise": 129900,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 53938265588006,
        "title": "Sony",
        "priceInPaise": 89900,
        "available": false,
        "sku": null
      },
      {
        "shopifyId": 53938265620774,
        "title": "Fujifilm price change",
        "priceInPaise": 89900,
        "available": false,
        "sku": null
      }
    ],
    "missingImages": false,
    "needsFinish": false
  },
  {
    "slug": "mobile-sticker",
    "shopifyId": 10639792341286,
    "title": "MOBILE  STICKER",
    "category": "phone",
    "finish": null,
    "description": "",
    "images": [],
    "models": [],
    "minPriceInPaise": 150000,
    "maxPriceInPaise": 150000,
    "variants": [
      {
        "shopifyId": 53755598766374,
        "title": "Apple",
        "priceInPaise": 150000,
        "available": true,
        "sku": null
      },
      {
        "shopifyId": 53755598799142,
        "title": "samsung",
        "priceInPaise": 150000,
        "available": false,
        "sku": null
      },
      {
        "shopifyId": 53788914712870,
        "title": "Redmi",
        "priceInPaise": 150000,
        "available": false,
        "sku": null
      },
      {
        "shopifyId": 53788914745638,
        "title": "Xiaomi",
        "priceInPaise": 150000,
        "available": false,
        "sku": null
      },
      {
        "shopifyId": 53788914778406,
        "title": "Poco",
        "priceInPaise": 150000,
        "available": false,
        "sku": null
      },
      {
        "shopifyId": 53788914811174,
        "title": "Vivo",
        "priceInPaise": 150000,
        "available": false,
        "sku": null
      },
      {
        "shopifyId": 53788914843942,
        "title": "Nothing",
        "priceInPaise": 150000,
        "available": false,
        "sku": null
      },
      {
        "shopifyId": 53788914876710,
        "title": "OnePlus",
        "priceInPaise": 150000,
        "available": false,
        "sku": null
      }
    ],
    "missingImages": true,
    "needsFinish": true
  }
];

export const IMPORT_STATS = {
  sourceProducts: 26,
  sourceCollections: 30,
  imported: 17,
  skipped: 9,
  missingImages: 12,
  needsFinish: 6,
  totalVariants: 200,
} as const;
