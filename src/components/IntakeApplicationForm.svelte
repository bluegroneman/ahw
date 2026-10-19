<script>
  import { onMount, tick } from 'svelte';

  let currentStep = 1;
  let enhanced = false;
  let form;
  let status = 'idle';
  let errorMessage = '';
  const totalSteps = 5;
  const steps = [
    { number: 1, title: 'Personal Info' },
    { number: 2, title: 'Household & Needs' },
    { number: 3, title: 'Financials' },
    { number: 4, title: 'Agencies' },
    { number: 5, title: 'Uploads & Consent' }
  ];

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
    <h2>Tell us how we can help</h2>
    <p>Complete the five sections below to request assistance from Almost Home Wyoming. Fields marked * are required.</p>
    <p>Your answers are not saved until you submit. Please have your identification and income documents ready if you would like to include them.</p>
    <p>Need help completing this application? Call <a href="tel:+13074383332">(307) 438-3332</a>.</p>
  </div>

  {#if enhanced}
    <!-- Step Progress Bar -->
    <ol class="progress-bar" aria-label="Application progress">
      {#each steps as step}
        <li class="step-indicator" aria-current={currentStep === step.number ? 'step' : undefined} class:active={currentStep === step.number} class:completed={currentStep > step.number}>
          <div class="step-circle">{step.number}</div>
          <span class="step-title">{step.title}</span>
        </li>
      {/each}
    </ol>
    <p class="step-summary" aria-live="polite">Step {currentStep} of {totalSteps}: {steps[currentStep - 1].title}</p>
  {/if}

    <form bind:this={form} name="almost-home-application" method="POST" action="/application-received/" data-netlify="true" netlify-honeypot="bot-field" on:submit={handleSubmit} novalidate={enhanced} enctype="multipart/form-data" aria-busy={status === 'submitting'}>
      <input type="hidden" name="form-name" value="almost-home-application" />

      <p class="hidden-field">
        <label>Don’t fill this out if you're human: <input name="bot-field" /></label>
      </p>

      <!-- STEP 1: PERSONAL INFORMATION -->
        <fieldset data-step="1" hidden={enhanced && currentStep !== 1} disabled={status === 'submitting'}>
          <legend tabindex="-1">Step 1: Primary Applicant Information</legend>
          <div class="grid">
            <label>Last Name * <input type="text" autocomplete="family-name" name="lastName" required /></label>
            <label>First Name * <input type="text" autocomplete="given-name" name="firstName" required /></label>
          </div>

          <label>Physical Address * <input type="text" autocomplete="street-address" name="physicalAddress" required /></label>
          <label>Mailing Address (if different) <input type="text" name="mailingAddress" /></label>

          <div class="grid">
            <label>Date of Birth * <input type="date" autocomplete="bday" name="dob" required /></label>
            <label>Phone Number * <input type="tel" autocomplete="tel" name="phone" required /></label>
          </div>

          <div class="grid">
            <label>Emergency Contact Person <input type="text" name="emergencyContact" /></label>
            <label>Emergency Contact Phone <input type="tel" name="emergencyPhone" /></label>
          </div>

          <div class="grid">
            <label>Gender
              <select name="gender">
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </label>

            <label>Marital Status
              <select name="maritalStatus">
                <option value="">Select...</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
              </select>
            </label>
          </div>

          <div class="grid">
            <label>Race
              <select name="race">
                <option value="">Select...</option>
                <option value="Caucasian">Caucasian</option>
                <option value="Hispanic">Hispanic</option>
                <option value="African American">African American</option>
                <option value="Native American">Native American</option>
              </select>
            </label>

            <label>If Native American, Enrolled?
              <select name="nativeEnrolled">
                <option value="N/A">N/A</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </label>

            <label>Tribal Affiliation
              <select name="tribalAffiliation">
                <option value="None">None</option>
                <option value="Arapaho">Arapaho</option>
                <option value="Shoshone">Shoshone</option>
                <option value="Other">Other</option>
              </select>
            </label>
          </div>

          <div class="grid">
            <label>Veteran Status
              <select name="veteranStatus">
                <option value="Non-Veteran">Non-Veteran</option>
                <option value="Veteran">Veteran</option>
              </select>
            </label>
            <label>Branch <input type="text" name="militaryBranch" /></label>
          </div>

          <div class="grid">
            <label>Education
              <select name="education">
                <option value="">Select...</option>
                <option value="0-8">0-8 Grade</option>
                <option value="9-12/Non Graduate">9-12 / Non-Graduate</option>
                <option value="HS Graduate">HS Graduate</option>
                <option value="GED">GED</option>
                <option value="12 Plus Some Post Highschool">12 Plus Some Post High School</option>
                <option value="2 or 4 Year College Degree">2 or 4 Year College Degree</option>
              </select>
            </label>

            <label>Disabled
              <select name="disabled">
                <option value="Unspecified">Unspecified</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </label>

            <label>Health Insurance
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
        </fieldset>

      <!-- STEP 2: HOUSEHOLD & HOUSING NEEDS -->
        <fieldset data-step="2" hidden={enhanced && currentStep !== 2} disabled={status === 'submitting'}>
          <legend tabindex="-1">Step 2: Household & Housing Needs</legend>
          <div class="grid">
            <label>Housing Situation
              <select name="householdStatus">
                <option value="">Select...</option>
                <option value="Homeless">Homeless</option>
                <option value="Temporary">Temporary</option>
                <option value="Own">Own</option>
                <option value="Rent">Rent</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label>Adults Count <input type="number" name="adultsCount" min="0" value="1" /></label>
            <label>Children Count <input type="number" name="childrenCount" min="0" value="0" /></label>
          </div>

          <div class="grid">
            <label>Family Type
              <select name="familyType">
                <option value="">Select...</option>
                <option value="Single Person">Single Person</option>
                <option value="Single Parent Female">Single Parent Female</option>
                <option value="Single Parent Male">Single Parent Male</option>
                <option value="2 Adults/No Children">2 Adults / No Children</option>
                <option value="2 Parents">2 Parents</option>
                <option value="Extended">Extended</option>
              </select>
            </label>

            <label>Number Needing Housing Together
              <input type="number" name="peopleNeedingHousing" min="1" />
            </label>
          </div>

          <label>Names & Ages of Household Members Needing Housing
            <textarea name="namesAgesNeedingHousing" rows="3" placeholder="e.g. Jane Doe (32), John Doe (8)"></textarea>
          </label>

          <label>What type of assistance are you looking for and why? *
            <textarea name="assistanceTypeAndReason" rows="3" required></textarea>
          </label>

          <label>Where did you sleep last night? *
            <input type="text" name="whereSleptLastNight" required />
          </label>

          <label>What prevents you from immediately locating and maintaining stable housing? *
            <textarea name="housingBarriers" rows="3" required></textarea>
          </label>
        </fieldset>

      <!-- STEP 3: FINANCIALS & EMPLOYMENT -->
        <fieldset data-step="3" hidden={enhanced && currentStep !== 3} disabled={status === 'submitting'}>
          <legend tabindex="-1">Step 3: Income, Expenses & Employment</legend>
          <div class="grid">
            <label>Current Employer <input type="text" name="selfEmployer" /></label>
            <label>Hourly Wage / Salary ($) <input type="number" step="0.01" name="selfWage" /></label>
            <label>Hours per Week <input type="number" name="selfHours" /></label>
          </div>

          <div class="grid">
            <label>Total Household Income (Without Food Stamps) ($)
              <input type="number" step="0.01" name="totalIncomeNoFoodStamps" />
            </label>
            <label>Total Household Income (With Food Stamps) ($)
              <input type="number" step="0.01" name="totalIncomeWithFoodStamps" />
            </label>
            <label>Total Monthly Expenses ($)
              <input type="number" step="0.01" name="totalMonthlyExpenses" />
            </label>
          </div>

          <div class="grid">
            <label>Willing and Able to Work?
              <select name="willingAndAbleToWork">
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </label>
            <label>Currently Employed?
              <select name="currentlyEmployed">
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </label>
          </div>

          <label>If able to work, why unemployed?
            <textarea name="reasonUnemployed" rows="2"></textarea>
          </label>

          <label>Type of jobs interested in
            <input type="text" name="jobsInterestedIn" />
          </label>
        </fieldset>

      <!-- STEP 4: AGENCY ASSISTANCE HISTORY -->
        <fieldset data-step="4" hidden={enhanced && currentStep !== 4} disabled={status === 'submitting'}>
          <legend tabindex="-1">Step 4: Have you visited any of these agencies?</legend>
          <div class="grid">
            <label>LIEAP
              <select name="agencyLIEAP"><option value="No">No</option><option value="Yes">Yes</option></select>
            </label>
            <label>Section 8
              <select name="agencySection8"><option value="No">No</option><option value="Yes">Yes</option></select>
            </label>
            <label>TANF
              <select name="agencyTANF"><option value="No">No</option><option value="Yes">Yes</option></select>
            </label>
            <label>Food Stamps / SNAP
              <select name="agencyFoodStamps"><option value="No">No</option><option value="Yes">Yes</option></select>
            </label>
            <label>Homeless Shelter
              <select name="agencyHomelessShelter"><option value="No">No</option><option value="Yes">Yes</option></select>
            </label>
          </div>
        </fieldset>

      <!-- STEP 5: FILE UPLOADS & CONSENT -->
        <fieldset data-step="5" hidden={enhanced && currentStep !== 5} disabled={status === 'submitting'}>
          <legend tabindex="-1">Step 5: Document Uploads & Release Authorization</legend>

          <p class="upload-help">Optional: attach one document per field as PDF, JPG, PNG, or WebP. Keep combined uploads to 7 MB or less. Combine multiple pages into a PDF if needed.</p>
          <div class="upload-section">
            <label>Upload Photo I.D.s for Adults (PDF or Image)
              <input type="file" name="idProof" accept="application/pdf,image/jpeg,image/png,image/webp" />
            </label>

            <label>Upload Proof of Income or Proof of No Income (PDF or Image)
              <input type="file" name="incomeProof" accept="application/pdf,image/jpeg,image/png,image/webp" />
            </label>
          </div>

          <blockquote class="release-text">
            I hereby authorize release of my personal information, either verbally or in writing regarding background information on my history of employment, financial, residential, medical, legal or education to ALMOST HOME WYOMING for the sole purpose of providing needed referral, resource information or other services to assist me with my personal need(s). I acknowledge that ALMOST HOME WYOMING is not responsible for my actions regarding rental properties. I certify that all of the above information is true, accurate and complete to the best of my knowledge.
          </blockquote>

          <div class="grid">
            <label>Full Legal Signature (Type Full Name) *
              <input type="text" name="consentSignature" required />
            </label>
            <label>Date *
              <input type="date" name="consentDate" required />
            </label>
          </div>
        </fieldset>

      <!-- Navigation Controls -->
      <div class="nav-buttons">
        {#if enhanced && currentStep > 1}
          <button type="button" class="btn-secondary" disabled={status === 'submitting'} on:click={prevStep}>Previous</button>
        {/if}

        {#if enhanced && currentStep < totalSteps}
          <button type="button" class="btn-primary" on:click={nextStep}>Next Step</button>
        {:else}
          <button type="submit" class="btn-submit" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Submitting Application...' : 'Submit Application'}
          </button>
        {/if}
      </div>

      {#if status === 'error'}
        <p class="error-message" role="alert">{errorMessage}</p>
      {/if}
    </form>
</div>

<style>
  .form-wrapper { max-width: 56rem; margin: 0 auto; padding: clamp(1rem, 4vw, 2.5rem); border: 1px solid #e5e7eb; border-radius: 1rem; background: white; box-shadow: 0 4px 20px #00000008; color: #333; }
  .form-intro { margin-bottom: 2rem; }
  h2 { font-size: 1.75rem; line-height: 1.2; }
  p { margin-top: 0.75rem; line-height: 1.65; color: #4b5563; }
  a { color: #245bb4; text-decoration: underline; }
  .progress-bar { display: flex; justify-content: space-between; gap: 0.25rem; padding: 0; margin: 0 0 1rem; list-style: none; }
  .step-indicator { display: flex; flex: 1; flex-direction: column; align-items: center; gap: 0.5rem; color: #6b7280; }
  .step-indicator.active { color: #245bb4; font-weight: 700; }
  .step-indicator.completed { color: #246467; }
  .step-circle { width: 2rem; height: 2rem; border-radius: 50%; background: #e5e7eb; display: flex; align-items: center; justify-content: center; }
  .active .step-circle { background: #3c78e0; color: white; }
  .completed .step-circle { background: #50bec1; color: #173e40; }
  .step-title { font-size: 0.8rem; text-align: center; }
  .step-summary { margin-bottom: 1.5rem; font-weight: 600; }
  fieldset { min-width: 0; border-top: 1px solid #e5e7eb; padding-top: 1.5rem; margin-top: 1.5rem; }
  fieldset[hidden] { display: none; }
  legend { font-weight: 700; font-size: 1.15rem; padding-right: 0.75rem; color: #1f2937; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr)); gap: 1rem; }
  label { display: flex; min-width: 0; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem; font-size: 0.9rem; font-weight: 500; line-height: 1.5; }
  input, select, textarea { width: 100%; min-width: 0; padding: 0.7rem; border: 1px solid #9ca3af; border-radius: 0.375rem; background: white; color: #1f2937; font: inherit; }
  textarea { resize: vertical; }
  input:focus-visible, select:focus-visible, textarea:focus-visible, button:focus-visible, legend:focus-visible { outline: 2px solid #3c78e0; outline-offset: 3px; }
  .upload-help { margin-bottom: 1rem; font-size: 0.9rem; }
  .upload-section { background: #f0fafa; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; }
  .release-text { font-size: 0.9rem; background: #f9fafb; padding: 1rem; border-left: 4px solid #50bec1; margin-bottom: 1.25rem; line-height: 1.7; }
  .hidden-field { display: none; }
  .nav-buttons { display: flex; flex-wrap: wrap; gap: 1rem; justify-content: space-between; margin-top: 1.5rem; }
  button { padding: 0.8rem 1.25rem; border-radius: 0.375rem; font-weight: 600; cursor: pointer; }
  .btn-primary, .btn-submit { background: #2c63bd; color: white; margin-left: auto; }
  .btn-primary:hover, .btn-submit:hover { background: #1e478a; }
  .btn-secondary { background: #f3f4f6; color: #333; border: 1px solid #d1d5db; }
  button:disabled { opacity: 0.6; cursor: wait; }
  .error-message { color: #b91c1c; padding: 1rem; background: #fef2f2; border-radius: 0.5rem; }
  @media (max-width: 480px) { .step-title { display: none; } }
</style>
