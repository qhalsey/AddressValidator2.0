const express = require("express");
const xml2js = require("xml2js");
const axios = require("axios");

const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 3000;

const USER_ID = process.env.USPS_API_KEY;

app.get("/validate-address", async (req, res) => {
	const { address1, address2, city, state, zip5, zip4 } = req.query;

	const xmlRequest = `<AddressValidateRequest USERID="${USER_ID}">
                          <Address ID="0">
                            <Address1>${address1 || ""}</Address1>
                            <Address2>${address2 || ""}</Address2>
                            <City>${city || ""}</City>
                            <State>${state || ""}</State>
                            <Zip5>${zip5 || ""}</Zip5>
                            <Zip4>${zip4 || ""}</Zip4>
                          </Address>
                        </AddressValidateRequest>`;

	try {
		const response = await axios.get(
			"http://production.shippingapis.com/ShippingAPI.dll",
			{
				params: {
					API: "Verify",
					XML: xmlRequest,
				},
			}
		);

		const parsedResponse = await xml2js.parseStringPromise(response.data, {
			explicitArray: false,
		});

		console.log(parsedResponse);

		//check if the response has error field
		if (parsedResponse.AddressValidateResponse.Error) {
			res.status(400).json({
				error: parsedResponse.AddressValidateResponse.Error.Description,
			});
		} else {
			res.json(parsedResponse.AddressValidateResponse.Address);
		}
	} catch (error) {
		res
			.status(500)
			.json({ error: "An error occurred while processing the request." });
	}
});

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});
