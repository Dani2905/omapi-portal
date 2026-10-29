import React, { useState } from 'react';
import Breadcrumb from '../components/Breadcrumb';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Message envoyé avec succès ! (Simulation)');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <Breadcrumb items={[{ label: 'Contact' }]} />

      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
           <h1 className="text-4xl font-bold text-primary mb-4">Contactez-nous</h1>
           <p className="text-xl text-gray-600">
              Vous avez une question sur un dépôt de marque ou de brevet ? Notre équipe est là pour vous répondre.
           </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
           {/* Info Cards */}
           <div className="space-y-6">
              <div className="bg-white p-8 rounded-xl shadow-md border-l-4 border-primary flex items-start">
                 <div className="bg-blue-50 p-4 rounded-full text-primary text-xl mr-6">
                    <i className="fas fa-map-marker-alt"></i>
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Notre Adresse</h3>
                    <p className="text-gray-600">
                       LOT VH 69<br/>
                       Volosarika Ambanidia<br/>
                       Antananarivo 101, Madagascar
                    </p>
                 </div>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-md border-l-4 border-secondary flex items-start">
                 <div className="bg-blue-50 p-4 rounded-full text-secondary text-xl mr-6">
                    <i className="fas fa-phone"></i>
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Téléphone</h3>
                    <p className="text-gray-600 mb-1">(+261 34) 43 152 36</p>
                 </div>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-md border-l-4 border-accent flex items-start">
                 <div className="bg-blue-50 p-4 rounded-full text-accent text-xl mr-6">
                    <i className="fas fa-envelope"></i>
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Email</h3>
                    <p className="text-gray-600 mb-1">omapi@moov.mg</p>
                 </div>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-md border-l-4 border-gray-400 flex items-start">
                 <div className="bg-gray-100 p-4 rounded-full text-gray-600 text-xl mr-6">
                    <i className="fas fa-clock"></i>
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Horaires</h3>
                    <p className="text-gray-600">Lundi - Vendredi : 08h00 - 16h00</p>
                    <p className="text-gray-500 text-sm mt-1">Fermé le week-end et jours fériés</p>
                 </div>
              </div>
           </div>

           {/* Form */}
           <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Envoyez-nous un message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                 <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                    <input
                       type="text"
                       id="name"
                       name="name"
                       required
                       value={formData.name}
                       onChange={handleChange}
                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                       placeholder="Votre nom"
                    />
                 </div>
                 
                 <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                       type="email"
                       id="email"
                       name="email"
                       required
                       value={formData.email}
                       onChange={handleChange}
                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                       placeholder="votre@email.com"
                    />
                 </div>

                 <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">Sujet</label>
                    <select
                       id="subject"
                       name="subject"
                       required
                       value={formData.subject}
                       onChange={handleChange}
                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                    >
                       <option value="">Sélectionnez un sujet</option>
                       <option value="marque">Dépôt de marque</option>
                       <option value="brevet">Dépôt de brevet</option>
                       <option value="dessin">Dessin & Modèle</option>
                       <option value="autre">Autre demande</option>
                    </select>
                 </div>

                 <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea
                       id="message"
                       name="message"
                       required
                       rows={5}
                       value={formData.message}
                       onChange={handleChange}
                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                       placeholder="Comment pouvons-nous vous aider ?"
                    ></textarea>
                 </div>

                 <button
                    type="submit"
                    className="w-full bg-primary hover:bg-secondary text-white font-bold py-4 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
                 >
                    Envoyer le message
                 </button>
              </form>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
