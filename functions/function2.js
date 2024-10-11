import dns from "dns"
import net from "net"
import util from "util"
// import fs from "fs"

const resolveMx = util.promisify(dns.resolveMx);

const checkEmailDeliverability = async (email) => {
    const [localPart, domain] = email.split('@');
    try {
    const mxRecords = await resolveMx(domain);
    if (mxRecords.length === 0) {
      console.log('No MX records found for domain:', domain);
      return false;
    }

    const mxServer = mxRecords[0].exchange;
    const client = net.createConnection(25, mxServer, () => {
      console.log('Connected to', mxServer);
    });

    let step = 0; 
    return new Promise((resolve) => {
      client.setEncoding('utf8');

      client.on('data', (data) => {
          console.log('Server response:', data);

        if (step === 0) {
          client.write(`HELO ${domain}\r\n`);
          step++;
        } else if (step === 1) {
            client.write(`MAIL FROM:<test@${domain}>\r\n`);
          step++;
        } else if (step === 2) {
          client.write(`RCPT TO:<${email}>\r\n`);
          step++;
        } else if (step === 3) {
          if (data.startsWith('250')) {
            resolve(true); 
          } else {
            resolve(false); 
        }
          client.end(); 
        }
      });

      client.on('error', (err) => {
          console.error('Connection error:', err);
        resolve(false);
    });

      client.on('end', () => {
        console.log('Connection ended');
    });
    });
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
};

const processEmails = async (toCheckemails) => {
    console.log("Processinf emails",toCheckemails)
    const emails = toCheckemails
    const validEmails = [];
    const invalidEmails = [];
  
    for (const email of emails) {
      const isDeliverable = await checkEmailDeliverability(email);
      if (isDeliverable) {
          console.log(`${email} is deliverable`);
          validEmails.push(email);
        } else {
        console.log(`${email} is not deliverable`);
        invalidEmails.push(email);
    }
}
console.log('Email processing completed.');
    return {validEmails,invalidEmails}
  };
  
  
export const function2 = async (emails) => {
  const res = await processEmails(emails);
  return res;
};