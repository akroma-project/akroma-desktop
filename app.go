package main

import (
	"context"
	"io/ioutil"
	"log"
	"math/big"
	"os"
	"os/user"
	"strconv"

	"github.com/ethereum/go-ethereum/accounts/keystore"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
)

// App struct
type App struct {
	ctx context.Context
}

type AccountResult struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Address string `json:"address"`
	Name    string `json:"name"`
	Path    string `json:"path"`
}

type SendCommand struct {
	Path        string `json:"path"`
	FromAddress string `json:"fromAddress"`
	ToAddress   string `json:"toAddress"`
	Password    string `json:"password"`
	Amount      string `json:"amount"`
	Nonce       string `json:"nonce"`
}

type SendResult struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Hash    string `json:"hash"`
}

// AkromaDesktop creates a new App application struct
func AkromaDesktop() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) getHomeDir() string {
	user, err := user.Current()
	if err != nil {
		log.Fatalf(err.Error())
	}
	homeDirectory := user.HomeDir
	akromaDirectory := homeDirectory + "/.akroma/keystore"
	log.Default().Printf("returning directory: %s", akromaDirectory)
	return akromaDirectory
}

func (a *App) Send(command SendCommand) SendResult {
	log.Default().Printf("Send command: %v", command)
	ks := keystore.NewKeyStore(os.TempDir(), keystore.StandardScryptN, keystore.StandardScryptP)
	jsonBytes, err := ioutil.ReadFile(command.Path)
	if err != nil {
		log.Default().Print(err.Error())
		return SendResult{false, "Could not read file", ""}
	}

	account, unlocked := ks.Import(jsonBytes, command.Password, command.Password)
	log.Default().Printf("Account: %s", account.URL.Path)

	if unlocked != nil {
		log.Default().Printf("could not unlock account: %s", unlocked.Error())
		return SendResult{false, "Could not unlock account", ""}
	}
	log.Default().Printf("Account unlocked: %s", account.Address.Hex())
	client, err := ethclient.Dial("https://boot2.akroma.org")

	nonce, err := client.PendingNonceAt(context.Background(), account.Address)
	if err != nil {
		return SendResult{false, "Could not get nonce", ""}
	}
	if command.Nonce != "" {
		nonce, err = strconv.ParseUint(command.Nonce, 10, 64)
	}
	log.Default().Printf("Nonce: %d", nonce)

	feeCap, _ := client.SuggestGasPrice(context.Background())
	log.Default().Printf("GasPrice: %d", feeCap)

	value, _ := new(big.Int).SetString(command.Amount, 10)
	log.Default().Printf("Value: %d", value)

	tx := types.NewTx(
		&types.LegacyTx{
			Nonce:    nonce,
			GasPrice: feeCap,
			Gas:      31000,
			To:       (*common.Address)(common.FromHex(command.ToAddress)),
			Value:    value,
			Data:     nil,
		})
	signedTx, _ := ks.SignTxWithPassphrase(account, command.Password, tx, big.NewInt(200625))
	log.Default().Printf("Signed transaction: %s", signedTx.Hash().Hex())

	delete := os.Remove(account.URL.Path)
	if delete != nil {
		return SendResult{false, "Could not delete account", ""}
	}

	e := client.SendTransaction(context.Background(), signedTx)
	if e != nil {
		log.Default().Printf("Could not send transaction, error: %s", e)
		return SendResult{false, "Could not send transaction", ""}
	}
	return SendResult{true, "Transaction sent", signedTx.Hash().Hex()}
}

func (a *App) GetAccounts() []AccountResult {
	dir := a.getHomeDir()
	var accounts []AccountResult
	ks := keystore.NewKeyStore(dir, keystore.StandardScryptN, keystore.StandardScryptP)
	wallets := ks.Wallets()
	for _, w := range wallets {
		for _, a := range w.Accounts() {
			r := AccountResult{true, "Account found", a.Address.Hex(), "", a.URL.Path}
			accounts = append(accounts, r)
		}
	}
	return accounts
}

func (a *App) CreateAccount(name string, password string) AccountResult {
	dir := a.getHomeDir()
	ks := keystore.NewKeyStore(dir, keystore.StandardScryptN, keystore.StandardScryptP)
	account, err := ks.NewAccount(password)
	if err != nil {
		log.Fatal(err)
	}
	log.Default().Printf("Account created: %s", account.Address.Hex())
	r := AccountResult{true, "Account created", account.Address.Hex(), name, dir}
	return r
}
