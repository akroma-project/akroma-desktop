export namespace main {
	
	export class AccountResult {
	    success: boolean;
	    message: string;
	    address: string;
	    name: string;
	    path: string;
	
	    static createFrom(source: any = {}) {
	        return new AccountResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.message = source["message"];
	        this.address = source["address"];
	        this.name = source["name"];
	        this.path = source["path"];
	    }
	}
	export class SendCommand {
	    path: string;
	    fromAddress: string;
	    toAddress: string;
	    password: string;
	    amount: string;
	    nonce: string;
	
	    static createFrom(source: any = {}) {
	        return new SendCommand(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.path = source["path"];
	        this.fromAddress = source["fromAddress"];
	        this.toAddress = source["toAddress"];
	        this.password = source["password"];
	        this.amount = source["amount"];
	        this.nonce = source["nonce"];
	    }
	}
	export class SendResult {
	    success: boolean;
	    message: string;
	    hash: string;
	
	    static createFrom(source: any = {}) {
	        return new SendResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.message = source["message"];
	        this.hash = source["hash"];
	    }
	}

}

