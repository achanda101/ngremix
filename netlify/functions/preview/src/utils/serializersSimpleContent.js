const urlFor = require("../utils/imageUrl");
const client = require("../utils/sanityClient")
const pageSettings = require("../utils/pageSettings")

const pattern = /^image-([a-f\d]+)-(\d+x\d+)-(\w+)$/

// asset._ref:image-2be3816058af1a2aedbbae41c381def16ee052ec-1079x1095-jpg
const decodeAssetId = id => {
    const [ , assetId, dimensions, format ] = pattern.exec(id)
    const [ width, height ] = dimensions.split("x").map(v => parseInt(v, 10))

    return {
        assetId,
        dimensions: { width, height },
        format,
    }
}

module.exports = {
    types: {
        a11yImage: ({ node }) => {
            const image = new Object()
            image.credit = node.credit
            image.caption = node.imgcaption
            image.alt = node.imgalt
            image.assets = decodeAssetId(node.asset._ref)

            const widths = { "mob": 560, "tab": 768, "desk": 1046 }
            const webpURLs = new Object()
            const sizes = "(max-width: 800px) 200px, 50vw"
            const loadingOption = "eager", decoding = "async"
            const desk_h = image.assets.dimensions.height / image.assets.dimensions.width * widths.desk

            for (const screenKey in widths) {
                webpURLs[ screenKey ] = urlFor(node).format('webp').width(widths[ screenKey ]).url()
            }

            // console.dir(webpURLs)

            return `<div class="image-plus top-flow"><picture><source type="image/webp" srcset="${webpURLs[ "mob" ]} 560w, ${webpURLs[ "tab" ]} 768w, ${webpURLs[ "desk" ]} 1046w" sizes="${sizes}">
            <img alt="${image.alt}" loading="${loadingOption}" decoding="${decoding}" src="${webpURLs[ "mob" ]}" width="${widths[ "desk" ]}" height="${desk_h}"></picture><div class="credit" data-image-credit="${image.credit}" ></div></div>`
        },
        ngTable: ({ node }) => {
            if (node.tableContent) {
                const rowsHtml = new Array()
                for (const row of node.tableContent.rows) {
                    const rowHtml = new Array()
                    for (let index = 0; index < row.cells.length; index++) {
                        const element = row.cells[ index ];
                        const cellHtml = index < 1 ? `<td><b>${element}</b></td>` : `<td>${element}</td>`
                        rowHtml.push(cellHtml)
                    }
                    const singleRowCellsHtml = rowHtml.join('')
                    const singleRowHtml = `<tr>${singleRowCellsHtml}</tr>`
                    rowsHtml.push(singleRowHtml)
                }
                const allRowsHtml = rowsHtml.join('')
                return `<table class="basic">${allRowsHtml}</table>`
            } else {
                return ``
            }
        }
    },
    marks: {
        center: ({ mark, children }) => {
            return `<span class="centerflex">${children}</span>`;
        },
        right: ({ mark, children }) => {
            return `<span class="rightflex">${children}</span>`
        },
        semibold: ({ mark, children }) => {
            return `<span style="font-weight: 400">${children}</span>`
        },
        underline: ({ mark, children }) => {
            return `<span class="underline">${children}</span>`
        },
        redtext: ({ mark, children }) => {
            return `<span class="redtext">${children}</span>`
        },
        greytext: ({ mark, children }) => {
            return `<span class="infotext">${children}</span>`
        },
        extlink: ({ mark, children }) => {
            var { url } = mark
            // Get rid of anything following a ? in the link
            url = url.split("?")[ 0 ]
            return `<a href=${url} class="bodylink" target="_blank" rel="noopener noreferer">${children}</a>`
        },
        intlink: ({ mark, children }) => {
            const { slug = {} } = mark
            const href = `/${slug.current}`
            return `<a href=${href} class="bodylink">${children}</a>`
        }
    },
    list: ({ type, children }) => {
        // console.dir(type) //-- gives the type of list style, bullet, nobullet,number, etc
        const listStr = children.join('') //remove the , between list items

        switch (type) {
            case 'bullet':
                return `<ul class="basic">${listStr}</ul>`
            case 'nobullet':
                return `<ul class="basic no-bullets">${listStr}</ul>`
            case 'number':
                return `<ol class="basic">${listStr}</ol>`
            default:
                break;
        }
    },
    listItem: ({ node, children }) => {
        // console.log(node.listItem) -- gives the type of list style, bullet, nobullet, numberetc
        return `<li>${children}</li>`
    }
}