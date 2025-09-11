# Leaderboard Integration

We provide board hosting services and scoreboard synchronization during competitions.

## DOMjudge Integration

If you place your DOMjudge scoreboard in a public network environment, we can directly crawl and parse the HTML. However, this approach has some disadvantages:

- Cannot get correct submissions data, can only fake it from scoreboard data

We strongly recommend using [dump-to-xcpcio][dump-to-xcpcio] to push DOMjudge data to us during competitions. If you choose this approach, you need to [contact us](#contact-us) in advance to apply for a token.

We strongly recommend testing the scoreboard synchronization during practice sessions to observe the script's impact on your server and prevent issues during official competitions.

### Advantages of the Recommended Approach

- **No Public IP Required**: Contest organizers don't need to place DOMjudge scoreboards in public environments. You only need internet access to push partial DOMjudge data to XCPCIO servers.

- **More Accurate Data**: Can obtain more precise data, such as real submissions instead of fake ones.

- **Low Server Load**: The script requests several DOMjudge APIs every 5 seconds and pushes data to remote servers. No need to worry about external traffic accessing the public scoreboard causing server issues.

## Other Online Judges

For custom online judges not listed above, please [contact us](#contact-us) to discuss synchronization options.

## Contact Us {#contact-us}

- **Email**: <board@xcpcio.com>
- **GitHub Issues**: [https://github.com/xcpcio/xcpcio/issues](https://github.com/xcpcio/xcpcio/issues)

[dump-to-xcpcio]: https://github.com/xcpcio/domjudge-utility/tree/main/cmd/dump-to-xcpcio
