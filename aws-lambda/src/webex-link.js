export default function generateWebexLink(firstName, lastName) {
    return process.env.WEBEX_LINK_TEMPLATE.replace('{first_name}', firstName).replace('{last_name}', lastName);
}