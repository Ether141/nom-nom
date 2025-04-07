import AddressManager from "/js/components/address-manager/address-manager.js";
import WalletPay from "./components/wallet-pay/wallet-pay.js";

let x = true;
document.getElementsByTagName("x-wallet-pay")[0].show();
document.getElementById("btn-add-funds").addEventListener("click", () => {
    if (!x) {
        document.getElementsByTagName("x-wallet-pay")[0].show();
    } else {
        document.getElementsByTagName("x-wallet-pay")[0].hide();
    }

    x = !x;
});