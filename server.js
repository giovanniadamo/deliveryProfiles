const bodyParser = require('body-parser');
const cors = require('cors')
const express = require('express')
const Shopify = require('shopify-api-node');

const shopify = new Shopify({
  shopName: 'atoms-apps-development',
  apiKey: '50b5e45a359681bd2f85c820c1adb7dc',
  password: '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'
});

var corsOptions = {
  origin: 'https://dev.allnutrition.cl',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

const app = express();
const port = 3000;

app.use(cors(corsOptions))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/create-shipping-profile', async (req, res) => {
  console.log(req.body)
  try{
    const variables = req.body
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
    .then((profile) => {
      if(profile){
        console.log(profile)
        res.send(profile)
      }else{
        return
      }
    })
    .catch((err) => {
      console.error(err)
      res.send(err)
    });
  }catch(error){
    console.log(error)
    res.send(error)
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