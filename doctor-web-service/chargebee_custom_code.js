// chargebee_custom_code.js
exports.fetchAllowedPlanConfig = function ({subscription, item_prices}, callback) {
  const allowedPlans = ['Basic-INR-Monthly', 'Basic-INR-Yearly']
  const output = {
    use_existing_addons: false,
    items: [],
  }

  const selectedPlans = item_prices.filter((plan) => allowedPlans.includes(plan.item_price.id))
  const addonItemPrices = item_prices.filter(
    ({item_price}) =>
      item_price.id === 'storage-INR-Monthly' || item_price.id === 'storage-INR-Yearly'
  )

  selectedPlans.forEach((p) => {
    const entry = createPlanEntry(p, subscription)

    // Always add storage addons to allowed_addons
    const storageAddons = [
      createAddonEntry({item_price: {id: 'storage-INR-Monthly'}}, subscription),
      createAddonEntry({item_price: {id: 'storage-INR-Yearly'}}, subscription),
    ]

    storageAddons.forEach((storageAddon) => {
      entry.allowed_addons.push(storageAddon)
    })

    // Add actual addons if present in item_prices
    addonItemPrices.forEach((addonItemPrice) => {
      const addonEntry = createAddonEntry(addonItemPrice, subscription)
      entry.addons.push(addonEntry)
    })

    output.items.push(entry)
  })

  callback(null, output)
}

function createPlanEntry(plan, subscription) {
  const entry = {
    plan_id: plan.item_price.id,
    meta_data: {},
    allowed_addons: [],
    addons: [],
  }

  if (plan.item_price.pricing_model === 'stairstep') {
    const currentQuantity = getCurrentQuantity(plan.item_price.id, subscription)
    entry.meta_data = {
      quantity_meta: {
        type: 'range',
        min: currentQuantity,
        max: 300,
        step: 50,
      },
    }
  }

  return entry
}

function createAddonEntry(addonItemPrice, subscription) {
  const currentQuantity = getCurrentQuantity(addonItemPrice.item_price.id, subscription)
  const step = determineStep(currentQuantity)
  return {
    id: addonItemPrice.item_price.id,
    meta_data: {
      quantity_meta: {
        type: 'range',
        min: currentQuantity,
        max: 100,
        step: step,
      },
    },
  }
}

function determineStep() {
  return 10
}

function getCurrentQuantity(itemPriceId, subscription) {
  return (
    subscription.subscription_items.find((item) => item.item_price_id === itemPriceId)?.quantity ||
    1
  )
}
