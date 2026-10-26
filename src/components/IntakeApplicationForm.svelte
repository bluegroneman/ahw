<script>
  import { onMount, tick } from 'svelte';

  let currentStep = 1;
  let enhanced = false;
  let form;
  let status = 'idle';
  let errorMessage = '';
  let race = '';
  let veteranStatus = 'Non-Veteran';
  let currentlyEmployed = 'No';
  let idProofName = '';
  let incomeProofName = '';
  let consentDate = new Date().toISOString().slice(0, 10);
  const totalSteps = 5;
  const agencies = [
    { name: 'agencyLIEAP', label: 'LIEAP' },
    { name: 'agencySection8', label: 'Section 8' },
    { name: 'agencyTANF', label: 'TANF' },
    { name: 'agencyPOWER', label: 'POWER' },
    { name: 'agencyWIC', label: 'WIC' },
    { name: 'agencyFoodStamps', label: 'Food Stamp' },
    { name: 'agencyJobServices', label: 'Job Services' },
    { name: 'agencyCounselingServices', label: 'Counseling Services' },
    { name: 'agencyWSIL', label: 'WSIL' },
    { name: 'agencyMedicareMedicaid', label: 'Medicare/Medicaid' },
    { name: 'agencyKidsCareTitle19', label: 'Kids Care/Title 19' },
    { name: 'agencyHomelessShelter', label: 'Homeless Shelter' },
    { name: 'agencyVOCRehab', label: 'VOC Rehab' },
    { name: 'agencyCommodities', label: 'Commodities' }
  ];
  const steps = [
    { number: 1, title: 'About you', short: 'You' },
    { number: 2, title: 'Household', short: 'Home' },
    { number: 3, title: 'Income', short: 'Income' },
    { number: 4, title: 'Agencies', short: 'Help' },
    { number: 5, title: 'Review', short: 'Send' }
  ];

  $: progressPercent = (currentStep / totalSteps) * 100;

  onMount(() => { enhanced = true; });

  async function showStep(step) {
    currentStep = step;
    await tick();
    form.querySelector('[data-step="' + step + '"] legend').focus();
  }

  function validateStep(step) {
    const fields = form.querySelectorAll('[data-step="' + step + '"] input, [data-step="' + step + '"] select, [data-step="' + step + '"] textarea');
    for (const field of fields) {
      if (!field.reportValidity()) return false;
    }
    return true;
  }

  function nextStep() {
    if (validateStep(currentStep) && currentStep < totalSteps) showStep(currentStep + 1);
  }

  function prevStep() {
    if (currentStep > 1) showStep(currentStep - 1);
  }

  function goToStep(step) {
    if (step < currentStep) showStep(step);
  }

  function handleFileChange(event, kind) {
    const file = event.currentTarget.files?.[0];
    const name = file ? file.name : '';
    if (kind === 'id') idProofName = name;
    if (kind === 'income') incomeProofName = name;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (status === 'submitting') return;
    // Pressing Enter in an earlier step should advance, never submit prematurely.
    if (currentStep < totalSteps) {
      nextStep();
      return;
    }
    for (let step = 1; step <= totalSteps; step += 1) {
      const invalid = form.querySelector('[data-step="' + step + '"] :invalid');
      if (invalid) {
        await showStep(step);
        invalid.reportValidity();
        return;
      }
    }

    const formData = new FormData(form);
    const files = [...formData.values()].filter(value => value instanceof File && value.size > 0);
    if (files.some(file => !['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(file.type))) {
      status = 'error';
      errorMessage = 'Please upload PDF, JPG, PNG, or WebP documents.';
      return;
    }
    // Leave room for multipart headers within Netlify Forms’ 8 MB request limit.
    if (files.reduce((total, file) => total + file.size, 0) > 7 * 1024 * 1024) {
      status = 'error';
      errorMessage = 'Please choose smaller documents. Uploads must total 7 MB or less.';
      return;
    }
    status = 'submitting';
    try {
      const response = await fetch('/apply/', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Submission failed');
      window.location.assign('/application-received/');
    } catch {
      status = 'error';
      errorMessage = 'We could not submit your application. Your answers are still here. Please try again, or call (307) 438-3332 for help.';
    }
  }
</script>

<div class="form-wrapper">
  <div class="form-intro">
    <p>Answer one section at a time. Required questions are marked with a red asterisk (<span class="req">*</span>).</p>
    <ul class="prep-list">
      <li>Your answers are not saved until you tap Submit. Please finish in one sitting.</li>
      <li>Photo ID and proof of income are helpful, but you can submit without them.</li>
      <li>Need help? Call <a href="tel:+13074383332">(307) 438-3332</a>.</li>
    </ul>
  </div>

  {#if enhanced}
    <div class="progress-block">
      <p class="step-summary" aria-live="polite">
        Step {currentStep} of {totalSteps}: {steps[currentStep - 1].title}
      </p>
      <div class="progress-track" aria-hidden="true">
        <div class="progress-fill" style="width: {progressPercent}%"></div>
      </div>
      <ol class="progress-bar" aria-label="Application progress">
        {#each steps as step}
          <li>
            <button
              type="button"
              class="step-indicator"
              class:active={currentStep === step.number}
              class:completed={currentStep > step.number}
              aria-current={currentStep === step.number ? 'step' : undefined}
              aria-label={currentStep > step.number ? `Go back to ${step.title}` : `Step ${step.number}: ${step.title}`}
              disabled={step.number >= currentStep}
              on:click={() => goToStep(step.number)}
            >
              <span class="step-circle">{currentStep > step.number ? '✓' : step.number}</span>
              <span class="step-title">{step.title}</span>
              <span class="step-title-short">{step.short}</span>
            </button>
          </li>
        {/each}
      </ol>
    </div>
  {/if}
    <form
            bind:this={form}
            name="almost-home-application"
            method="POST"
            action="https://almost-home-form-handler.bluedojo.workers.dev/submit"
            novalidate={enhanced}
            enctype="multipart/form-data"
            aria-busy={status === 'submitting'}>
      <input type="hidden" name="form-name" value="almost-home-application" />

      <p class="hidden-field">
        <label>Don’t fill this out if you're human: <input name="bot-field" /></label>
      </p>

      <!-- STEP 1: PERSONAL INFORMATION -->
        <fieldset data-step="1" hidden={enhanced && currentStep !== 1} disabled={status === 'submitting'}>
          <legend tabindex="-1">Step 1: About you</legend>
          <p class="step-lead">Start with your name and how we can reach you. Background questions later on this page are optional.</p>

          <section class="field-group" aria-labelledby="name-heading">
            <h3 id="name-heading">Your name</h3>
            <div class="grid">
              <label>First name <span class="req">*</span>
                <input type="text" autocomplete="given-name" name="firstName" required />
              </label>
              <label>Last name <span class="req">*</span>
                <input type="text" autocomplete="family-name" name="lastName" required />
              </label>
            </div>
            <label>Date of birth <span class="req">*</span>
              <input type="date" autocomplete="bday" name="dob" required />
            </label>
          </section>

          <section class="field-group" aria-labelledby="contact-heading">
            <h3 id="contact-heading">How we can reach you</h3>
            <div class="grid">
              <label>Phone number
                <input type="tel" autocomplete="tel" name="phone" inputmode="tel" aria-describedby="phone-hint" />
              </label>
              <label>Physical address
                <input type="text" autocomplete="street-address" name="physicalAddress" />
              </label>
            </div>
            <p id="phone-hint" class="hint">A number we can call or text is the fastest way to follow up.</p>
            <label>Mailing address, if different
              <input type="text" autocomplete="billing street-address" name="mailingAddress" />
            </label>
          </section>

          <section class="field-group" aria-labelledby="emergency-heading">
            <h3 id="emergency-heading">Emergency contact</h3>
            <p class="hint" id="emergency-hint">Optional. Someone we can call if we cannot reach you.</p>
            <div class="grid">
              <label>Contact person’s name <input type="text" name="emergencyContact" autocomplete="off" /></label>
              <label>Contact person’s phone <input type="tel" name="emergencyPhone" inputmode="tel" /></label>
            </div>
          </section>

          <section class="field-group" aria-labelledby="background-heading">
            <h3 id="background-heading">Background information <span class="optional-tag">Optional</span></h3>
            <p class="hint">These answers help us understand your situation. Skip any you prefer not to share.</p>
            <div class="grid">
              <label>Gender
                <select name="gender">
                  <option value="">Prefer not to say</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </label>

              <label>Marital status
                <select name="maritalStatus">
                  <option value="">Prefer not to say</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                </select>
              </label>
            </div>

            <div class="grid">
              <label>Race
                <select name="race" bind:value={race}>
                  <option value="">Prefer not to say</option>
                  <option value="Caucasian">Caucasian</option>
                  <option value="Hispanic">Hispanic</option>
                  <option value="African American">African American</option>
                  <option value="Native American">Native American</option>
                </select>
              </label>

              {#if race === 'Native American'}
                <label>If Native American, enrolled?
                  <select name="nativeEnrolled">
                    <option value="N/A">N/A</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </label>

                <label>Tribal affiliation
                  <select name="tribalAffiliation">
                    <option value="None">None</option>
                    <option value="Arapaho">Arapaho</option>
                    <option value="Shoshone">Shoshone</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
              {:else}
                <input type="hidden" name="nativeEnrolled" value="N/A" />
                <input type="hidden" name="tribalAffiliation" value="None" />
              {/if}
            </div>

            <div class="grid">
              <label>Veteran status
                <select name="veteranStatus" bind:value={veteranStatus}>
                  <option value="Non-Veteran">Non-veteran</option>
                  <option value="Veteran">Veteran</option>
                </select>
              </label>
              {#if veteranStatus === 'Veteran'}
                <label>Military branch <input type="text" name="militaryBranch" /></label>
              {/if}
            </div>

            <div class="grid">
              <label>Highest education
                <select name="education">
                  <option value="">Prefer not to say</option>
                  <option value="0-8">0–8 grade</option>
                  <option value="9-12/Non Graduate">9–12 / did not graduate</option>
                  <option value="HS Graduate">High school graduate</option>
                  <option value="GED">GED</option>
                  <option value="12 Plus Some Post Highschool">Some college</option>
                  <option value="2 or 4 Year College Degree">2- or 4-year college degree</option>
                </select>
              </label>

              <label>Do you have a disability?
                <select name="disabled">
                  <option value="Unspecified">Prefer not to say</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </label>

              <label>Health insurance
                <select name="healthInsurance">
                  <option value="None">None</option>
                  <option value="Military">Military</option>
                  <option value="Medicare">Medicare</option>
                  <option value="Medicaid">Medicaid</option>
                  <option value="Employer">Employer</option>
                  <option value="Other">Other</option>
                </select>
              </label>
            </div>
          </section>
        </fieldset>

      <!-- STEP 2: HOUSEHOLD & HOUSING NEEDS -->
        <fieldset data-step="2" hidden={enhanced && currentStep !== 2} disabled={status === 'submitting'}>
          <legend tabindex="-1">Step 2: Your household and housing</legend>
          <p class="step-lead">Tell us who needs a place to stay and what kind of help you are looking for.</p>

          <section class="field-group" aria-labelledby="household-heading">
            <h3 id="household-heading">Who lives with you</h3>
            <div class="grid two">
              <label>Number of adults
                <input type="number" name="adultsCount" min="0" value="1" inputmode="numeric" />
              </label>
              <label>Number of children
                <input type="number" name="childrenCount" min="0" value="0" inputmode="numeric" />
              </label>
            </div>
            <div class="grid">
              <label>Family type
                <select name="familyType">
                  <option value="">Select...</option>
                  <option value="Single Person">Single person</option>
                  <option value="Single Parent Female">Single parent — female</option>
                  <option value="Single Parent Male">Single parent — male</option>
                  <option value="2 Adults/No Children">Two adults, no children</option>
                  <option value="2 Parents">Two parents</option>
                  <option value="Extended">Extended family</option>
                </select>
              </label>
              <label>How many people need housing together?
                <input type="number" name="peopleNeedingHousing" min="1" inputmode="numeric" />
              </label>
            </div>
            <label>Names and ages of people needing housing
              <textarea name="namesAgesNeedingHousing" rows="3" placeholder="Example: Jane Doe (32), John Doe (8)"></textarea>
            </label>
          </section>

          <section class="field-group" aria-labelledby="housing-heading">
            <h3 id="housing-heading">Your housing situation</h3>
            <label>Current housing situation
              <select name="householdStatus">
                <option value="">Select...</option>
                <option value="Homeless">Homeless</option>
                <option value="Temporary">Temporary housing</option>
                <option value="Own">Own</option>
                <option value="Rent">Rent</option>
                <option value="Other">Other</option>
              </select>
            </label>
            <label>Where did you sleep last night? <span class="req">*</span>
              <input type="text" name="whereSleptLastNight" required />
            </label>
            <label>What type of assistance are you looking for, and why? <span class="req">*</span>
              <textarea name="assistanceTypeAndReason" rows="4" required placeholder="Example: help with a deposit so my children and I can move into an apartment"></textarea>
            </label>
            <label>What makes it hard to find or keep stable housing right now? <span class="req">*</span>
              <textarea name="housingBarriers" rows="4" required></textarea>
            </label>
          </section>
        </fieldset>

      <!-- STEP 3: FINANCIALS & EMPLOYMENT -->
        <fieldset data-step="3" hidden={enhanced && currentStep !== 3} disabled={status === 'submitting'}>
          <legend tabindex="-1">Step 3: Work and income</legend>
          <p class="step-lead">Approximate amounts are fine. This helps us understand what you can afford.</p>

          <section class="field-group" aria-labelledby="work-heading">
            <h3 id="work-heading">Work</h3>
            <div class="grid two">
              <label>Are you currently employed?
                <select name="currentlyEmployed" bind:value={currentlyEmployed}>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </label>
              <label>Willing and able to work?
                <select name="willingAndAbleToWork">
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </label>
            </div>
            {#if currentlyEmployed === 'Yes'}
              <div class="grid">
                <label>Current employer <input type="text" name="selfEmployer" autocomplete="organization" /></label>
                <label>Hourly wage or salary ($)
                  <input type="number" step="0.01" min="0" name="selfWage" inputmode="decimal" />
                </label>
                <label>Hours per week
                  <input type="number" min="0" name="selfHours" inputmode="numeric" />
                </label>
              </div>
            {:else}
              <label>If you are able to work, what is keeping you from a job right now?
                <textarea name="reasonUnemployed" rows="3"></textarea>
              </label>
              <label>What kinds of jobs are you interested in?
                <input type="text" name="jobsInterestedIn" />
              </label>
            {/if}
          </section>

          <section class="field-group" aria-labelledby="money-heading">
            <h3 id="money-heading">Monthly household money</h3>
            <p class="hint">Use your best estimate. Include everyone in the household.</p>
            <div class="grid">
              <label>Total monthly income, without food stamps ($)
                <input type="number" step="0.01" min="0" name="totalIncomeNoFoodStamps" inputmode="decimal" />
              </label>
              <label>Total monthly income, with food stamps ($)
                <input type="number" step="0.01" min="0" name="totalIncomeWithFoodStamps" inputmode="decimal" />
              </label>
              <label>Total monthly expenses ($)
                <input type="number" step="0.01" min="0" name="totalMonthlyExpenses" inputmode="decimal" />
              </label>
            </div>
          </section>
        </fieldset>

      <!-- STEP 4: AGENCY ASSISTANCE HISTORY -->
        <fieldset data-step="4" hidden={enhanced && currentStep !== 4} disabled={status === 'submitting'}>
          <legend tabindex="-1">Step 4: Other agencies you have visited</legend>
          <p class="step-lead">Check every program or office you have already contacted. This helps us avoid duplicate work and connect you with the right partners. If none apply, tap Next.</p>
          <div class="agency-options" role="group" aria-label="Agencies visited">
            {#each agencies as agency}
              <label class="agency-option">
                <input type="checkbox" name={agency.name} value="Yes" />
                <span>{agency.label}</span>
              </label>
            {/each}
          </div>
        </fieldset>

      <!-- STEP 5: FILE UPLOADS & CONSENT -->
        <fieldset data-step="5" hidden={enhanced && currentStep !== 5} disabled={status === 'submitting'}>
          <legend tabindex="-1">Step 5: Documents and permission</legend>
          <p class="step-lead">Uploads are optional. If you have them ready, attach one file per box. Combined files must be 7 MB or less (PDF, JPG, PNG, or WebP).</p>

          <section class="field-group" aria-labelledby="uploads-heading">
            <h3 id="uploads-heading">Documents <span class="optional-tag">Optional</span></h3>
            <div class="upload-section">
              <label class="file-card">
                <span class="file-card-title">Photo IDs for adults</span>
                <span class="hint" id="id-hint">Driver’s license, state ID, or other photo ID. Combine pages into one PDF if needed.</span>
                <span class="file-button">Choose file</span>
                <span class="file-name">{idProofName || 'No file chosen'}</span>
                <input type="file" name="idProof" accept="application/pdf,image/jpeg,image/png,image/webp" aria-describedby="id-hint" on:change={(event) => handleFileChange(event, 'id')} />
              </label>

              <label class="file-card">
                <span class="file-card-title">Proof of income or no income</span>
                <span class="hint" id="income-hint">Pay stub, benefit letter, or a note explaining that you have no income.</span>
                <span class="file-button">Choose file</span>
                <span class="file-name">{incomeProofName || 'No file chosen'}</span>
                <input type="file" name="incomeProof" accept="application/pdf,image/jpeg,image/png,image/webp" aria-describedby="income-hint" on:change={(event) => handleFileChange(event, 'income')} />
              </label>
            </div>
          </section>

          <section class="field-group" aria-labelledby="consent-heading">
            <h3 id="consent-heading">Permission to review your application</h3>
            <blockquote class="release-text">
              I hereby authorize release of my personal information, either verbally or in writing regarding background information on my history of employment, financial, residential, medical, legal or education to ALMOST HOME WYOMING for the sole purpose of providing needed referral, resource information or other services to assist me with my personal need(s). I acknowledge that ALMOST HOME WYOMING is not responsible for my actions regarding rental properties. I certify that all of the above information is true, accurate and complete to the best of my knowledge.
            </blockquote>

            <div class="grid two">
              <label>Type your full legal name as your signature <span class="req">*</span>
                <input type="text" name="consentSignature" autocomplete="name" required />
              </label>
              <label>Today’s date <span class="req">*</span>
                <input type="date" name="consentDate" bind:value={consentDate} required />
              </label>
            </div>
          </section>
        </fieldset>

      <!-- Navigation Controls -->
      <div class="nav-buttons">
        {#if enhanced && currentStep > 1}
          <button type="button" class="btn-secondary" disabled={status === 'submitting'} on:click={prevStep}>Back</button>
        {:else}
          <span></span>
        {/if}

        {#if enhanced && currentStep < totalSteps}
          <button type="button" class="btn-primary" on:click={nextStep}>Continue</button>
        {:else}
          <button type="submit" class="btn-submit" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Submitting application…' : 'Submit application'}
          </button>
        {/if}
      </div>

      {#if status === 'error'}
        <p class="error-message" role="alert">{errorMessage}</p>
      {/if}
    </form>
</div>

<style>
  .form-wrapper { max-width: 56rem; margin: 0 auto; padding: clamp(1rem, 4vw, 2.25rem); border: 1px solid #d1e6e6; border-radius: 1rem; background: #fff; box-shadow: 0 8px 24px #173e400d; color: #1f2937; }
  .form-intro { margin-bottom: 1.5rem; }
  p { margin-top: 0.75rem; line-height: 1.65; color: #4b5563; }
  a { color: #245bb4; text-decoration: underline; }
  .prep-list { margin: 1rem 0 0; padding-left: 1.2rem; color: #4b5563; }
  .prep-list li { margin-top: 0.4rem; line-height: 1.55; }
  .req { color: #b91c1c; font-weight: 700; }
  .optional-tag { margin-left: 0.4rem; padding: 0.1rem 0.45rem; border-radius: 999px; background: #eef2ff; color: #3730a3; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.02em; text-transform: uppercase; vertical-align: middle; }
  .progress-block { margin-bottom: 1.5rem; }
  .progress-track { height: 0.4rem; margin: 0.75rem 0 1rem; overflow: hidden; border-radius: 999px; background: #e5e7eb; }
  .progress-fill { height: 100%; border-radius: 999px; background: #3c78e0; transition: width 0.2s ease; }
  .progress-bar { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 0.35rem; padding: 0; margin: 0; list-style: none; }
  .step-indicator { display: flex; width: 100%; flex-direction: column; align-items: center; gap: 0.4rem; padding: 0.25rem; border: 0; background: transparent; color: #6b7280; cursor: pointer; }
  .step-indicator:disabled { cursor: default; }
  .step-indicator.active { color: #1e478a; font-weight: 700; }
  .step-indicator.completed { color: #246467; }
  .step-circle { width: 2rem; height: 2rem; border-radius: 50%; background: #e5e7eb; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 700; }
  .active .step-circle { background: #3c78e0; color: white; }
  .completed .step-circle { background: #50bec1; color: #173e40; }
  .step-title, .step-title-short { font-size: 0.75rem; text-align: center; line-height: 1.2; }
  .step-title-short { display: none; }
  .step-summary { margin: 0; font-weight: 700; color: #111827; }
  fieldset { min-width: 0; border: 0; padding: 0; margin: 0; }
  fieldset[hidden] { display: none; }
  legend { font-weight: 700; font-size: 1.25rem; color: #111827; }
  .step-lead { margin: 0.5rem 0 1.25rem; }
  .field-group { margin-bottom: 1.25rem; padding: 1rem 1rem 0.25rem; border: 1px solid #e5e7eb; border-radius: 0.85rem; background: #f8fbfb; }
  .field-group h3 { margin: 0 0 0.75rem; font-size: 1rem; font-weight: 700; color: #134e4a; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr)); gap: 0.85rem 1rem; }
  .grid.two { grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr)); }
  label { display: flex; min-width: 0; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem; font-size: 0.95rem; font-weight: 600; line-height: 1.4; color: #111827; }
  .hint { font-size: 0.85rem; font-weight: 400; color: #4b5563; line-height: 1.45; }
  input, select, textarea { width: 100%; min-width: 0; min-height: 2.75rem; padding: 0.7rem 0.8rem; border: 1px solid #6b7280; border-radius: 0.5rem; background: white; color: #111827; font: inherit; }
  textarea { min-height: 6rem; resize: vertical; }
  .agency-options { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr)); gap: 0.65rem; }
  .agency-option { flex-direction: row; align-items: center; gap: 0.75rem; margin: 0; padding: 0.85rem 0.9rem; border: 1px solid #9ca3af; border-radius: 0.65rem; background: white; cursor: pointer; font-weight: 600; }
  .agency-option:hover, .agency-option:has(input:checked) { background: #e4f5f5; border-color: #50bec1; }
  .agency-option:has(input:focus-visible) { outline: 2px solid #3c78e0; outline-offset: 2px; }
  .agency-option input { width: 1.25rem; height: 1.25rem; min-height: 1.25rem; padding: 0; flex-shrink: 0; accent-color: #2c63bd; }
  input:focus-visible, select:focus-visible, textarea:focus-visible, button:focus-visible, legend:focus-visible { outline: 2px solid #3c78e0; outline-offset: 3px; }
  .upload-section { display: grid; gap: 0.85rem; padding-bottom: 1rem; }
  .file-card { position: relative; margin: 0; padding: 1rem; border: 1px dashed #5b8f91; border-radius: 0.75rem; background: white; cursor: pointer; }
  .file-card:hover, .file-card:focus-within { border-color: #3c78e0; background: #f0f7ff; }
  .file-card-title { font-size: 1rem; }
  .file-button { display: inline-flex; width: fit-content; margin-top: 0.35rem; padding: 0.45rem 0.8rem; border-radius: 0.4rem; background: #2c63bd; color: white; font-size: 0.875rem; font-weight: 600; }
  .file-name { font-size: 0.85rem; font-weight: 400; color: #4b5563; }
  .file-card input[type="file"] { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
  .release-text { font-size: 0.95rem; font-weight: 400; background: white; padding: 1rem 1.1rem; border-left: 4px solid #50bec1; margin: 0 0 1.25rem; line-height: 1.7; color: #374151; }
  .hidden-field { display: none; }
  .nav-buttons { position: sticky; bottom: 0; display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: space-between; align-items: center; margin: 1.25rem -0.5rem 0; padding: 0.85rem 0.5rem 0.15rem; background: linear-gradient(#ffffffd6, #fff 35%); }
  button { min-height: 2.85rem; padding: 0.8rem 1.35rem; border: 0; border-radius: 0.5rem; font: inherit; font-weight: 700; cursor: pointer; }
  .btn-primary, .btn-submit { background: #2c63bd; color: white; margin-left: auto; }
  .btn-primary:hover, .btn-submit:hover { background: #1e478a; }
  .btn-secondary { background: #fff; color: #1f2937; border: 1px solid #9ca3af; }
  .btn-secondary:hover { background: #f3f4f6; }
  button:disabled { opacity: 0.6; cursor: wait; }
  .error-message { color: #991b1b; padding: 1rem; background: #fef2f2; border: 1px solid #fecaca; border-radius: 0.5rem; }
  @media (max-width: 640px) {
    .step-title { display: none; }
    .step-title-short { display: block; }
    .field-group { padding: 0.85rem 0.75rem 0.1rem; }
  }
</style>
