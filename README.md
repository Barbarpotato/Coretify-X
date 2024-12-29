# Coretify X
The Personal Coretify Version that used for privacy needs, Such as creating Proxy between client and backend server. It Contains Tricky algorithm about how transfering data works like hashing, encryption, decryption and a secret key.


## Proxy Route
<img src="https://firebasestorage.googleapis.com/v0/b/personal-blog-darmajr.appspot.com/o/personal%2FDocumentation%2FCoretify%2Fclient-server-proxy.png?alt=media&token=01173bea-276d-40c7-8681-5c2999af1235" />

- The client sends an initial request to the proxy (Coretify). This request does not include any sensitive tokens, ensuring secure interaction from the client side.
- The proxy generates a signed JWT token and sends it back to the client. This token serves as a temporary authentication mechanism.
- The client sends a new request to the Site Registry (CDN) and includes the JWT token received from the proxy in the request header.
- The Site Registry verifies the JWT token by forwarding it to the proxy. The proxy acts as a validator to confirm the token’s validity.
- If the proxy validates the JWT token, it grants access to the requested resource on the Site Registry. The requested data is then sent back to the client through the proxy.