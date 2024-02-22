export default function getExtraInfo() {
    return {
        pageTitle: document.title,
        pageUrl: location.href,
        platform: navigator.platform,
    }
}
