const bodyParser = require('body-parser');
const express = require('express')
const Shopify = require('shopify-api-node');

const shopify = new Shopify({
  shopName: 'atoms-apps-development',
  apiKey: '50b5e45a359681bd2f85c820c1adb7dc',
  password: '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'
});

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/create-shipping-profile', async (req, res) => {
  console.log(req.body)
  try{
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
    shopify
    .graphql(query, variables)
    .then((customers) => console.log(customers))
    .catch((err) => console.error(err));
  }catch(error){
    console.log(error)
  }

});


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});


/* {"profile": {
  "name": "render created",
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
              "name": "Creado desde render",
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