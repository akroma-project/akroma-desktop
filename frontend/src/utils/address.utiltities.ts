const sanatizeAddress = (address: string): string => {
  // prefix with 0x if not present
  if (address.indexOf("0x") !== 0) {
    address = "0x" + address;
  }
  return address;
}

export { sanatizeAddress };
