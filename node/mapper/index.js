import mapper from 'json-mapper-json';

export async function convert(prefix, data, event) {
  try {
    data.event = event || data.event;
    event = data.event.indexOf('message') >= 0 ? 'message' : data.event;
    let eventMapped = await configEvent(prefix, event);
    let typeMapped = await configType(prefix, event, data.type);
    Object.assign(eventMapped, typeMapped);
    if (!eventMapped) return data;
    return await mapper(data, eventMapped);
  } catch (e) {
    return data;
  }
}

async function configEvent(prefix, event) {
  try {
    let { default: mapped } = await import(`./${prefix}${event}.js`);
    if (!mapped) return undefined;
    return mapped;
  } catch (e) {
    return undefined;
  }
}

async function configType(prefix, event, type) {
  try {
    let { default: mappConf } = await import(`./${prefix}${event}-${type}.js`);
    if (!mappConf) return undefined;
    return mappConf;
  } catch (e) {
    return undefined;
  }
}
