## Privacy Policy

**Last updated:** 04-02-2026

### 1. Introduction

WPetition (“the Service”) is a petition management platform designed to collect digital signatures for submission to Parliament. We are committed to protecting user privacy and minimizing data retention.

### 2. Data We Collect

The Service collects **only the minimum information required** for a petition signature to be considered valid. The following personal data may be collected at the time of signing:

* Full Name
* Identification Card Number
* Handwritten Signature (SVG format)
* Timestamp of signature
* Associated Petition ID

This data corresponds to the following internal structure:

```
Name
IdCard
Signature_SVG
Timestamp
PetitionId
```

No additional personal, behavioral, tracking, or device data is collected.

### 3. Purpose of Data Collection

Collected data is used **solely** for the following purposes:

* Verifying and compiling valid petition signatures
* Exporting petition data for official submission to Parliament

The data is **not** used for marketing, profiling, automated decision-making, or tracking.

### 4. Data Sharing

WPetition does not directly transmit, submit, or share personal data with any parliamentary authority.

Personal data is disclosed only to the following party:

The individual who submits the petition, as the Service is designed to allow the petition author to export, print, and submit collected signatures to the relevant parliamentary authority on their own responsibility.

WPetition does not sell, license, rent, or otherwise disclose personal data to advertisers, analytics providers, data brokers, or external services.

Once petition data is exported by the petition author, WPetition no longer has access to, control over, or responsibility for that data. Any subsequent handling, storage, sharing, or submission of exported data including submission to a parliamentary authority is the sole responsibility of the petition author.

Notwithstanding the above, personal data may be disclosed only where required by applicable law, regulation, or lawful governmental request, or where such disclosure is necessary to protect the legal rights, security, or integrity of the Service.

### 5. Data Retention

Personal data is retained **only until the petition is exported and submitted**.

After submission:

* Name, ID card number, and handwritten signature are **permanently deleted**
* Only anonymized timestamp data is retained for internal analytical purposes

Once anonymization occurs, the remaining data **can no longer be linked to an individual**.

### 6. Data Security

Reasonable technical and organizational measures are implemented to protect collected data from unauthorized access, disclosure, or loss while it is temporarily stored.

### 7. User Rights

Because personal data is short-lived and deleted after submission, long-term access, correction, or deletion requests are generally unnecessary. However, users may contact the petition organizer prior to submission if they believe their information was entered incorrectly.

### 8. Changes to This Policy

This Privacy Policy may be updated to reflect changes in the Service. Updates will be published alongside the application or repository.

---

## Data Handling Policy

### 1. Data Minimization

WPetition follows a strict data-minimization approach:

* Only legally relevant petition signature data is collected
* No optional or background data is gathered

### 2. Data Storage

* Data is stored temporarily for the sole purpose of petition compilation
* No personal data is retained after submission to Parliament

### 3. Data Export

When a petition is finalized:

* Signature data is exported by the petition submitter
* Exported data is intended exclusively for parliamentary submission

### 4. Data Deletion and Anonymization

After submission:

* The following fields are **irreversibly deleted**:

  * Name
  * ID card number
  * Handwritten signature
* The timestamp is retained in anonymized form for aggregate analytics (e.g., submission trends)

No anonymized data can be reverse-engineered to identify a signer.

### 5. Third-Party Access

* No third-party processors, analytics platforms, or external services receive data
* All handling occurs within the scope of the Service and the submitting individual

### 6. Accountability

Responsibility for lawful submission and use of exported petition data lies with the individual or organization submitting the petition to Parliament.

### 7. Data Backups

To ensure system reliability and recovery in the event of failure, WPetition performs automated database backups.

Backups are created once per week

A maximum of three rotating backups are retained:

- Backup 1: retained for up to 30 days
- Backup 2: retained for up to 15 days
- Backup 3: retained for up to 7 days

Backups are automatically overwritten on a rolling basis

#### Retention of Personal Data in Backups

When personal data is deleted or anonymized within the active system (including after petition submission), residual copies of that data may temporarily persist within encrypted backups until those backups are overwritten.

As a result:

- Personal data may remain in backups for a maximum of 30 days

- Backup data is not actively accessed, processed, or restored except for disaster recovery purposes

- Backup data is not used for analytics, sharing, or any secondary purpose

- Once the backup rotation period expires, any remaining personal data is irreversibly overwritten.

- Access and Security of Backups

- Backup data is protected using appropriate technical and organizational safeguards

- Access to backups is strictly limited and controlled

- Backups are not shared with third parties