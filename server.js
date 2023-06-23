const express = require('express')
const Shopify = require('shopify-api-node');

const shopify = new Shopify({
  shopName: 'atoms-apps-development',
  apiKey: '50b5e45a359681bd2f85c820c1adb7dc',
  password: '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'
});

const app = express();
const port = 3000;

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/create-shipping-profile', async (req, res) => {
  console.log(req.body)
  const variables = await req.body.profile
  const query = `mutation deliveryProfileCreate($profile: DeliveryProfileInput!) {
    deliveryProfileCreate(profile: $profile) {
      profile {
        zoneCountryCount
        name
      }
      userErrors {
        field
        message
      }
    }
  }`;
  /* const variables = {
    "profile": {
      "name": "admin created",
      "locationGroupsToCreate": [
        {
          "locations": [
            "gid://shopify/Location/76352618802"
          ],
          "zonesToCreate": [
            {
              "countries": [
                {
                  "code": "MX",
                  "includeAllProvinces": true

                }
              ],
              "methodDefinitionsToCreate": [
                {
                  "active": true,
                  "description": "",
                  "name": "Creado desde admin",
                  "rateDefinition": {
                    "price": {
                      "amount": "999",
                      "currencyCode": "MXN"
                    }
                  }
                }
              ],
              "name": "admin"
            }
          ]
        }
      ]
    }
  } */
  shopify
  .graphql(query, variables)
  .then((customers) => console.log(customers))
  .catch((err) => console.error(err));

  /* try {
    const configuration = new Configuration({
      apiKey: process.env.DALLE_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    const response = await openai.createImage({
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });
    console.log(response.data)
    res.send(response.data);
  } catch (error) {
    console.log(error.data);
    res.status(500).send('Error generating image');
  } */
});


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
